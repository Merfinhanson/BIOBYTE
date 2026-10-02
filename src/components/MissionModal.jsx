import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import OmnitrixRing from "./OmnitrixRing";
import "./MissionModal.css";

/**
 * Secure mission-file panel. Opens one statement at a time, closes on
 * Escape or backdrop click, and hands focus back to the trigger on close.
 */
const MissionModal = ({ problem, onClose }) => {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      /* Keep Tab inside the panel while it is open */
      const focusable = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || !focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!problem) return undefined;

    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [problem, handleKeyDown]);

  if (!problem) return null;

  return createPortal(
    <div
      className="mission-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="mission-file"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`mission-title-${problem.id}`}
        style={{ "--hue": problem.hue }}
      >
        <span className="file-scan" aria-hidden="true" />

        <OmnitrixRing hue={problem.hue} className="file-ring" />

        <header className="file-head">
          <div>
            <p className="file-eyebrow">Open Statement</p>
            <p className="file-code">
              [{problem.id}] {problem.alien}
            </p>
            <h2 className="file-title" id={`mission-title-${problem.id}`}>
              {problem.title}
            </h2>
            <p className="file-domain">{problem.domain}</p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="file-close"
            onClick={onClose}
            aria-label="Close statement"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="file-body">
          <h3 className="file-subhead">Mission</h3>
          <p className="file-summary">{problem.summary}</p>

          <h3 className="file-subhead">Build targets</h3>
          <ul className="file-points">
            {problem.points.map((point) => (
              <li key={point}>
                <span className="point-tick" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>

          <h3 className="file-subhead">Suggested tech</h3>
          <ul className="file-tech">
            {problem.tech.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <footer className="file-foot">
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Close statement
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};

export default MissionModal;