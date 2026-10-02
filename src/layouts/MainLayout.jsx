import React, { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Footer from "../components/Footer";
import { openRegisterGate } from "../utils/registerGate";
import { scrollToSection } from "../utils/scroll";
import useScrollMood from "../utils/useScrollMood";
import "./MainLayout.css";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "problems", label: "Challenges" },
  { id: "timeline", label: "How it works" },
  { id: "prizes", label: "Prizes" },
  { id: "faq", label: "FAQs" },
  { id: "core-team", label: "Core Team" },
  { id: "contact", label: "Contact" },
];

const MainLayout = ({ children }) => {
  /* Background tone drifts with scroll position. */
  useScrollMood();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  /* Navbar solidifies once the page leaves the top */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Highlight the section currently in view */
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* A resize back to desktop must not leave the mobile panel open */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = (event) => event.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback((id) => {
    setMenuOpen(false);
    scrollToSection(id);
  }, []);

  const handleRegister = useCallback(() => {
    setMenuOpen(false);
    scrollToSection("register");
    // Open the gate only because the user explicitly asked for it.
    openRegisterGate();
  }, []);

  return (
    <div className="main-layout">
      <header className={`navbar ${scrolled ? "is-scrolled" : ""}`}>
        <nav className="navbar-inner" aria-label="Primary">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              goTo("top");
            }}
          >
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-text">
              <span className="brand-name">BIOBYTE</span>
              <span className="brand-sub">Crescent Technocrats</span>
            </span>
          </a>

          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${activeId === item.id ? "is-active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="navbar-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleRegister}>
              <Zap size={15} />
              Register Now
            </button>

            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="nav-toggle-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-mobile-link ${activeId === item.id ? "is-active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="btn btn-primary btn-block" onClick={handleRegister}>
            <Zap size={15} />
            Register Now
          </button>
        </div>
      )}

      <main className="page-body">
        <div className="container">{children}</div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
