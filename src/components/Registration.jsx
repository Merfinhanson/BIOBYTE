import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CircleCheckBig,
  Clock,
  FileText,
  GraduationCap,
  IndianRupee,
  ListChecks,
  LoaderCircle,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Terminal,
  TriangleAlert,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { isAllowedEmail } from "../config/access";
import ScrollReveal from "./ScrollReveal";
import CardReveal from "./CardReveal";
import { EVENT, PROBLEMS } from "../data/site";
import {
  OPEN_REGISTER_EVENT,
  consumeRegisterGateRequest,
} from "../utils/registerGate";
import { scrollToSection } from "../utils/scroll";
import { submitRegistration } from "../lib/register";
import "./Registration.css";

const STAGE = {
  LOCKED: "locked",
  AUTH: "auth",
  VERIFY: "verify",
  FORM: "form",
  SUCCESS: "success",
};

const MAX_PPT_BYTES = 10 * 1024 * 1024;
const PPT_TYPES = [
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/pdf",
];

/** Rejects with a clear message if a promise never settles. */
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), ms),
    ),
  ]);
}

const Registration = () => {
  /* Always starts locked — the login gate is never shown on page load. */
  const [stage, setStage] = useState(STAGE.LOCKED);
  const [user, setUser] = useState(null);
  const [returning, setReturning] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const [form, setForm] = useState({
    teamName: "",
    college: "",
    members: "",
    problem: "",
    abstract: "",
    memberDetails: [],
  });
  const [ppt, setPpt] = useState(null);
  const [pptError, setPptError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* Spreadsheet sync state. Firestore is saved first and is the source of
     truth; Excel is appended afterwards. If that append fails we keep the
     payload so only the Excel call is retried — never a duplicate upload. */
  const [syncingExcel, setSyncingExcel] = useState(false);
  const [pendingExcel, setPendingExcel] = useState(null);

  const pollRef = useRef(null);

  /* ---- Restore an existing verified session without prompting ---- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setReturning(
        Boolean(nextUser?.emailVerified) && isAllowedEmail(nextUser.email),
      );
    });
    return unsubscribe;
  }, []);

  /* ---- The gate opens only on an explicit "Register Now" ---- */
  useEffect(() => {
    const open = () => {
      setError(null);
      setStage((current) =>
        current === STAGE.SUCCESS ? current : STAGE.AUTH,
      );
    };

    // Honour a click that landed before this lazy chunk mounted.
    if (consumeRegisterGateRequest()) open();

    window.addEventListener(OPEN_REGISTER_EVENT, open);
    return () => window.removeEventListener(OPEN_REGISTER_EVENT, open);
  }, []);

  /* ---- Poll for email confirmation while the verify stage is open ---- */
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      if (attempts > 20) {
        stopPolling();
        return;
      }
      try {
        await reload(auth.currentUser);
        if (auth.currentUser?.emailVerified) {
          stopPolling();
          setStage(STAGE.FORM);
        }
      } catch {
        stopPolling();
      }
    }, 3000);
  }, [stopPolling]);

  /* ---- Google sign-in ---- */
  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await withTimeout(
        signInWithPopup(auth, new GoogleAuthProvider()),
        30000,
        "Google sign-in",
      );

      if (!isAllowedEmail(result.user.email)) {
        // Stop immediately: this address cannot register for BIOBYTE.
        await signOut(auth);
        setStage(STAGE.LOCKED);
        setError(
          "Verification required. BIOBYTE registration is limited to approved college email addresses.",
        );
        return;
      }

      setUser(result.user);
      setReturning(false);

      if (result.user.emailVerified) {
        setStage(STAGE.FORM);
      } else {
        setStage(STAGE.VERIFY);
        startPolling();
      }
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in window was closed before completing.");
      } else {
        setError(err?.message || "Google sign-in failed. Please try again.");
      }
      setStage(STAGE.LOCKED);
    } finally {
      setBusy(false);
    }
  };

  /* ---- Verification helpers ---- */
  const handleSendLink = async () => {
    setError(null);
    setBusy(true);
    try {
      await withTimeout(
        sendEmailVerification(auth.currentUser),
        15000,
        "Sending verification link",
      );
      setLinkSent(true);
      startPolling();
    } catch (err) {
      setError(
        err?.code === "auth/too-many-requests"
          ? "Too many requests. Please try again in a moment."
          : err?.message || "Could not send the verification link.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCheckVerified = async () => {
    setError(null);
    setVerifying(true);
    try {
      await withTimeout(reload(auth.currentUser), 15000, "Verification check");
      if (auth.currentUser?.emailVerified) {
        stopPolling();
        setStage(STAGE.FORM);
      } else {
        setError("Not verified yet. Open the link in your inbox, then check again.");
      }
    } catch (err) {
      setError(err?.message || "Could not verify right now. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSignOut = async () => {
    stopPolling();
    await signOut(auth);
    setUser(null);
    setStage(STAGE.LOCKED);
    setError(null);
    setLinkSent(false);
  };

  /* ---- Form plumbing ---- */
  const update = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleMembersCount = (event) => {
    const value = event.target.value;
    const count = Number(value) || 0;
    setForm((current) => {
      const details = [...(current.memberDetails || [])];
      if (count > details.length) {
        for (let i = details.length; i < count; i++) {
          details.push({ name: "", phone: "", department: "", year: "" });
        }
      } else {
        details.length = count;
      }
      return { ...current, members: value, memberDetails: details };
    });
    setFieldErrors((current) => ({ ...current, members: undefined }));
  };

  const updateMember = (index, field) => (event) => {
    const value = event.target.value;
    setForm((current) => {
      const details = [...current.memberDetails];
      details[index] = { ...details[index], [field]: value };
      return { ...current, memberDetails: details };
    });
    setFieldErrors((current) => ({ ...current, [`member_${index}_${field}`]: undefined }));
  };

  const handlePpt = (event) => {
    const file = event.target.files?.[0] ?? null;
    setPptError(null);
    setFieldErrors((current) => ({ ...current, ppt: undefined }));
    if (!file) {
      setPpt(null);
      return;
    }
    const okType = PPT_TYPES.includes(file.type) || /\.(ppt|pptx|pdf)$/i.test(file.name);
    if (!okType) {
      setPpt(null);
      setPptError("Only .ppt, .pptx or .pdf files are accepted.");
      return;
    }
    if (file.size > MAX_PPT_BYTES) {
      setPpt(null);
      setPptError("File must be 10 MB or smaller.");
      return;
    }
    setPpt(file);
  };

  const validate = () => {
    const errors = {};

    if (form.teamName.trim().length < 2) errors.teamName = "Enter your team name.";
    if (form.college.trim().length < 2) errors.college = "Enter your college name.";

    const size = Number(form.members);
    if (!form.members || size < 2 || size > 4) {
      errors.members = "Team size must be between 2 and 4.";
    }

    form.memberDetails.forEach((member, idx) => {
      if (member.name.trim().length < 2) errors[`member_${idx}_name`] = "Required";
      const digits = member.phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13) errors[`member_${idx}_phone`] = "Invalid number";
      if (member.department.trim().length < 2) errors[`member_${idx}_department`] = "Required";
      if (!member.year) errors[`member_${idx}_year`] = "Required";
    });

    if (!form.problem) errors.problem = "Select a problem statement.";

    if (!ppt) errors.ppt = "Upload your Round 1 PPT.";

    if (form.abstract.trim().length < 30) {
      errors.abstract = "Abstract must be at least 30 characters.";
    }

    return errors;
  };

  /* ---- Submit: try/catch/finally guarantees the state always clears ---- */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Some fields need attention before you can transmit.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // 1) Durable record first: PPT upload + Firestore write.
      const excelPayload = buildExcelPayload();

      await withTimeout(saveRegistration(), 60000, "Submission");

      // 2) Spreadsheet sync only after Firestore is safely stored.
      setSyncingExcel(true);

      try {
        await withTimeout(submitRegistration(excelPayload), 20000, "Spreadsheet sync");
        setPendingExcel(null);
        setStage(STAGE.SUCCESS);
      } catch (excelErr) {
        // Firestore already has the record, so do NOT re-run the whole submit.
        setPendingExcel(excelPayload);
        setError(
          excelErr?.message ||
            "Your registration was saved, but the organiser spreadsheet did not update.",
        );
      }
    } catch (err) {
      setError(
        err?.code === "storage/unauthorized"
          ? "Upload rejected by the server. Please try again."
          : err?.message || "Transmission failed. Please try again.",
      );
    } finally {
      setSyncingExcel(false);
      setSubmitting(false);
    }
  };

  /** Builds the payload for POST /api/register from current form state. */
  const buildExcelPayload = () => {
    const chosen = PROBLEMS.find((p) => p.id === form.problem);
    const headPhone =
      form.memberDetails.find((m) => m.phone.trim().length > 0)?.phone.trim() ?? "";

    return {
      timestamp: new Date().toISOString(),
      teamName: form.teamName.trim(),
      collegeName: form.college.trim(),
      memberNames: form.memberDetails
        .map((m) => m.name.trim())
        .filter(Boolean)
        .join(", "),
      contactNumber: headPhone,
      emailId: auth.currentUser?.email ?? "",
      problemStatement: chosen ? `${chosen.id} — ${chosen.title}` : form.problem,
      abstract: form.abstract.trim(),
      status: "registered",
    };
  };

  /** Retries only the spreadsheet append; Firestore and the PPT are untouched. */
  const handleRetryExcel = async () => {
    if (!pendingExcel || syncingExcel) return;

    setError(null);
    setSyncingExcel(true);

    try {
      await withTimeout(submitRegistration(pendingExcel), 20000, "Spreadsheet sync");
      setPendingExcel(null);
      setStage(STAGE.SUCCESS);
    } catch (err) {
      setError(
        err?.message ||
          "Still could not reach the organiser spreadsheet. Please try again.",
      );
    } finally {
      setSyncingExcel(false);
    }
  };

  const saveRegistration = async () => {
    const record = doc(collection(db, "registrations"));

    let pptUrl = null;
    if (ppt) {
      const safeName = ppt.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `registrations/${record.id}/${Date.now()}-${safeName}`;
      const uploaded = await uploadBytes(storageRef(storage, path), ppt, {
        contentType: ppt.type || "application/octet-stream",
      });
      pptUrl = await getDownloadURL(uploaded.ref);
    }

    await setDoc(record, {
      uid: auth.currentUser?.uid ?? null,
      teamName: form.teamName.trim(),
      collegeName: form.college.trim(),
      teamMembers: Number(form.members),
      memberDetails: form.memberDetails.map(m => ({
        name: m.name.trim(),
        phone: m.phone.trim(),
        department: m.department.trim(),
        year: m.year
      })),
      emailId: auth.currentUser?.email ?? "",
      problemStatement: form.problem,
      abstract: form.abstract.trim(),
      pptUrl,
      pptName: ppt?.name ?? null,
      round: "round-1",
      status: "registered",
      createdAt: serverTimestamp(),
    });
  };

  /* ---- Success: return to the hero ---- */
  const handleReturn = useCallback(() => {
    stopPolling();
    setStage(STAGE.LOCKED);
    setForm({ teamName: "", college: "", members: "", problem: "", abstract: "", memberDetails: [] });
    setPpt(null);
    setPptError(null);
    setFieldErrors({});
    setError(null);
    setLinkSent(false);
    setPendingExcel(null);
    scrollToSection("top");
  }, [stopPolling]);

  const email = user?.email ?? "";

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <section id="register" className="section section--airy register-section" data-stage={stage}>
      <CardReveal as="header" className="section-header">
        <span className="section-kicker">Registration</span>
        <h2 className="section-title">Register</h2>
        <div className="section-line" />
        <ScrollReveal textClassName="section-sub">
          Registration is limited to approved college email addresses. Teams of 2 to 4 register for one challenge track and submit a Round 1 PPT.
        </ScrollReveal>
      </CardReveal>

      <CardReveal className="terminal">
        {/* ---- terminal chrome ---- */}
        <div className="terminal-bar">
          <span className="terminal-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="terminal-title">BIOBYTE_REGISTRATION</span>
          <span className="terminal-status">
            <span className="status-dot" aria-hidden="true" />
            {stage === STAGE.SUCCESS ? "COMPLETE" : "ENCRYPTED"}
          </span>
        </div>

        <div className="terminal-body">
          <div className="terminal-scan" aria-hidden="true" />

          {error && (
            <div className="terminal-alert" role="alert">
              <TriangleAlert size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* ============ STAGE 1 — IDLE ============ */}
          {stage === STAGE.LOCKED && (
            <div className="terminal-pane">
              <div className="pane-head">
                <span className="pane-icon" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <h3 className="pane-title">Registration opens here</h3>
              </div>

              <p className="pane-text">
                Registration is limited to Crescent email addresses. Sign in with Google and we will take it from there.
              </p>

              <ul className="pane-log">
                <li>
                  <span>&gt;</span> Round 1 entry — free
                </li>
                <li>
                  <span>&gt;</span> Team size — {EVENT.teamSize}
                </li>
                <li>
                  <span>&gt;</span> Event day — {EVENT.time}
                </li>
              </ul>

              <div className="pane-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    returning && user ? setStage(STAGE.FORM) : setStage(STAGE.AUTH)
                  }
                >
                  <Zap size={16} />
                  Register Now
                </button>

                {returning && user && (
                  <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
                    <X size={15} />
                    Sign out
                  </button>
                )}
              </div>

              {returning && user && (
                <p className="pane-hint">
                  Verified session found — {user.displayName || email}. You can pick
                  up where you left off.
                </p>
              )}
            </div>
          )}

          {/* ============ STAGE 2 — GOOGLE GATE ============ */}
          {stage === STAGE.AUTH && (
            <div className="terminal-pane">
              <div className="pane-head">
                <span className="pane-icon" aria-hidden="true">
                  <ShieldCheck size={18} />
                </span>
                <h3 className="pane-title">Sign in with Google</h3>
              </div>

              <p className="pane-text">
                Sign in with your approved Google account to unlock the registration
                form. Unapproved addresses are rejected automatically.
              </p>

              <div className="pane-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  {busy ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <GoogleGlyph />
                  )}
                  {busy ? "Connecting…" : "Continue with Google"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={() => {
                    setError(null);
                    setStage(STAGE.LOCKED);
                  }}
                  disabled={busy}
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              </div>
            </div>
          )}

          {/* ============ STAGE 3 — EMAIL VERIFICATION ============ */}
          {stage === STAGE.VERIFY && (
            <div className="terminal-pane">
              <div className="pane-head">
                <span className="pane-icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <h3 className="pane-title">Check your email</h3>
              </div>

              <p className="pane-text">
                We sent a verification link to{" "}
                <strong className="pane-strong">{email}</strong>. Open it to unlock
                the registration form.
              </p>

              <div className="pane-actions pane-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCheckVerified}
                  disabled={verifying || busy}
                >
                  {verifying ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <CircleCheckBig size={16} />
                  )}
                  {verifying ? "Checking…" : "I have verified"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleSendLink}
                  disabled={busy}
                >
                  <Send size={15} />
                  {linkSent ? "Resend link" : "Send link"}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-block pane-quiet"
                onClick={handleSignOut}
              >
                Use a different account
              </button>
            </div>
          )}

          {/* ============ STAGE 4 — REGISTRATION FORM ============ */}
          {stage === STAGE.FORM && (
            <form className="terminal-pane reg-form" onSubmit={handleSubmit} noValidate>
              <div className="pane-head">
                <span className="pane-icon" aria-hidden="true">
                  <Terminal size={18} />
                </span>
                <h3 className="pane-title">Your Team</h3>
                <span className="pane-identity">{email}</span>
              </div>

              <div className="form-grid">
                <Field
                  icon={Users}
                  label="Team Name"
                  placeholder="e.g. Byte Force"
                  value={form.teamName}
                  onChange={update("teamName")}
                  error={fieldErrors.teamName}
                />

                <Field
                  icon={GraduationCap}
                  label="College Name"
                  placeholder="e.g. Crescent Institute"
                  value={form.college}
                  onChange={update("college")}
                  error={fieldErrors.college}
                />

                <div className={`field field-wide ${fieldErrors.members ? "has-error" : ""}`}>
                  <label className="field-label" htmlFor="reg-members">
                    <Users size={15} aria-hidden="true" />
                    Team Members
                  </label>
                  <select
                    id="reg-members"
                    className="field-input"
                    value={form.members}
                    onChange={handleMembersCount}
                  >
                    <option value="">Select size</option>
                    <option value="2">2 members</option>
                    <option value="3">3 members</option>
                    <option value="4">4 members</option>
                  </select>
                  {fieldErrors.members && (
                    <p className="field-error">{fieldErrors.members}</p>
                  )}
                </div>

                {form.memberDetails.map((member, idx) => (
                  <div key={idx} className="member-details-group field-wide">
                    <h4 className="member-heading">
                      {idx === 0 ? "Team Head (Operative 01)" : `Operative 0${idx + 1}`}
                    </h4>
                    <div className="form-grid-inner">
                      <div className={`field ${fieldErrors[`member_${idx}_name`] ? "has-error" : ""}`}>
                        <input className="field-input" placeholder="Full Name" value={member.name} onChange={updateMember(idx, "name")} />
                        {fieldErrors[`member_${idx}_name`] && <p className="field-error">{fieldErrors[`member_${idx}_name`]}</p>}
                      </div>
                      <div className={`field ${fieldErrors[`member_${idx}_phone`] ? "has-error" : ""}`}>
                        <input className="field-input" placeholder="Contact Number" type="tel" value={member.phone} onChange={updateMember(idx, "phone")} />
                        {fieldErrors[`member_${idx}_phone`] && <p className="field-error">{fieldErrors[`member_${idx}_phone`]}</p>}
                      </div>
                      <div className={`field ${fieldErrors[`member_${idx}_department`] ? "has-error" : ""}`}>
                        <input className="field-input" placeholder="Department" value={member.department} onChange={updateMember(idx, "department")} />
                        {fieldErrors[`member_${idx}_department`] && <p className="field-error">{fieldErrors[`member_${idx}_department`]}</p>}
                      </div>
                      <div className={`field ${fieldErrors[`member_${idx}_year`] ? "has-error" : ""}`}>
                        <select className="field-input" value={member.year} onChange={updateMember(idx, "year")}>
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                        {fieldErrors[`member_${idx}_year`] && <p className="field-error">{fieldErrors[`member_${idx}_year`]}</p>}
                      </div>
                    </div>
                  </div>
                ))}

                <Field
                  icon={Mail}
                  label="Email ID"
                  value={email}
                  readOnly
                  hint="Verified Google account"
                />

                <div className={`field field-wide ${fieldErrors.problem ? "has-error" : ""}`}>
                  <label className="field-label" htmlFor="reg-problem">
                    <ListChecks size={15} aria-hidden="true" />
                    Problem Statement Choice
                  </label>
                  <select
                    id="reg-problem"
                    className="field-input"
                    value={form.problem}
                    onChange={update("problem")}
                  >
                    <option value="">Select a challenge file</option>
                    {PROBLEMS.map((problem) => (
                      <option key={problem.id} value={problem.id}>
                        {problem.id} — {problem.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.problem && (
                    <p className="field-error">{fieldErrors.problem}</p>
                  )}
                </div>

                <div className={`field field-wide ${fieldErrors.ppt ? "has-error" : ""}`}>
                  <span className="field-label">
                    <Upload size={15} aria-hidden="true" />
                    PPT Upload
                  </span>

                  <label className="upload-box">
                    <Upload size={18} aria-hidden="true" />
                    <span className="upload-text">
                      {ppt ? ppt.name : "Attach your Round 1 PPT"}
                    </span>
                    <span className="upload-hint">.ppt, .pptx or .pdf — max 10 MB</span>
                    <input
                      type="file"
                      className="upload-input"
                      accept=".ppt,.pptx,.pdf"
                      onChange={handlePpt}
                    />
                  </label>

                  {pptError && <p className="field-error">{pptError}</p>}
                  {fieldErrors.ppt && <p className="field-error">{fieldErrors.ppt}</p>}
                </div>

                <div className={`field field-wide ${fieldErrors.abstract ? "has-error" : ""}`}>
                  <label className="field-label" htmlFor="reg-abstract">
                    <FileText size={15} aria-hidden="true" />
                    Short Abstract / Description
                  </label>
                  <textarea
                    id="reg-abstract"
                    className="field-input field-textarea"
                    rows={5}
                    maxLength={1200}
                    placeholder="Summarise your approach, the data you will use and the outcome you aim to demonstrate."
                    value={form.abstract}
                    onChange={update("abstract")}
                  />
                  <div className="field-foot">
                    {fieldErrors.abstract ? (
                      <p className="field-error">{fieldErrors.abstract}</p>
                    ) : (
                      <span className="field-hint">Minimum 30 characters</span>
                    )}
                    <span className="field-count">{form.abstract.length}/1200</span>
                  </div>
                </div>
              </div>

              <div className="form-submit">
                {/* Excel sync failed after Firestore saved — offer a safe
                    retry that does not re-upload the PPT. */}
                {pendingExcel && (
                  <>
                    <p className="pane-hint">
                      Your registration is safely stored. Only the organiser
                      spreadsheet needs to update.
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      onClick={handleRetryExcel}
                      disabled={syncingExcel}
                    >
                      {syncingExcel ? (
                        <LoaderCircle size={16} className="spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {syncingExcel ? "Syncing…" : "Retry spreadsheet sync"}
                    </button>
                  </>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting || syncingExcel}>
                  {submitting || syncingExcel ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting
                    ? "Transmitting…"
                    : syncingExcel
                      ? "Syncing…"
                      : "Submit Registration"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={handleSignOut}
                  disabled={submitting || syncingExcel}
                >
                  Use a different account
                </button>
              </div>
            </form>
          )}

          {/* ============ STAGE 5 — SUCCESS ============ */}
          {stage === STAGE.SUCCESS && (
            <div className="terminal-pane success-pane">
              <span className="success-mark" aria-hidden="true">
                <CircleCheckBig size={40} />
              </span>

              <h3 className="pane-title">You are registered</h3>

              <p className="pane-text">
                Your team <strong className="pane-strong">{form.teamName}</strong> is
                registered for Round 1. Keep your abstract and PPT ready for
                submission.
              </p>

              <ul className="success-log">
                <li>
                  <CircleCheckBig size={14} aria-hidden="true" />
                  Track locked — {PROBLEMS.find((p) => p.id === form.problem)?.title}
                </li>
                <li>
                  <Upload size={14} aria-hidden="true" />
                  PPT on file — {ppt?.name}
                </li>
                <li>
                  <Clock size={14} aria-hidden="true" />
                  Event day — {EVENT.time}
                </li>
                <li>
                  <IndianRupee size={14} aria-hidden="true" />
                  Round 1 is free — pay only if shortlisted
                </li>
              </ul>

              <div className="pane-actions">
                <button type="button" className="btn btn-primary btn-block" onClick={handleReturn}>
                  <ArrowLeft size={16} />
                  Return to Previous
                </button>
              </div>
            </div>
          )}
        </div>
      </CardReveal>
    </section>
  );
};

/* ---------------------------------------------------------
   Small building blocks
   --------------------------------------------------------- */

function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2C40.9 35.3 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function Field({ icon: Icon, label, error, hint, readOnly, ...inputProps }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label className="field-label" htmlFor={`reg-${label.toLowerCase().replace(/\s+/g, "-")}`}>
        <Icon size={15} aria-hidden="true" />
        {label}
      </label>

      <div className="field-wrap">
        <input
          id={`reg-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="field-input"
          readOnly={readOnly}
          {...inputProps}
        />
        {readOnly && <span className="field-verified" aria-hidden="true" />}
      </div>

      {error ? (
        <p className="field-error">{error}</p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export default Registration;
