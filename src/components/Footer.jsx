import React, { useCallback } from "react";
import { Dna, Zap } from "lucide-react";
import { EVENT, FOOTER_LINKS } from "../data/site";
import { openRegisterGate } from "../utils/registerGate";
import { scrollToSection } from "../utils/scroll";
import "./Footer.css";

const Footer = () => {
  const handleRegister = useCallback(() => {
    scrollToSection("register");
    openRegisterGate();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="container footer-inner">
        {/* ---- brand + description ---- */}
        <div className="footer-brand">
          <span className="footer-mark" aria-hidden="true">
            <Dna size={22} />
          </span>
          <p className="footer-slogan">
            {EVENT.name}
            <span className="footer-slogan-divider">—</span>
            <span className="footer-slogan-accent">{EVENT.tagline}</span>
          </p>
          <p className="footer-mini">
            A futuristic biotech hackathon by {EVENT.presenter}.
          </p>
        </div>

        {/* ---- quick links ---- */}
        <nav className="footer-links" aria-label="Footer">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className="footer-link"
                  onClick={() => scrollToSection(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---- final CTA ---- */}
        <div className="footer-cta">
          <h3 className="footer-heading">Bring a team</h3>
          <p className="footer-mini">
            Round 1 is free for Crescent email holders. Teams of 2 to 4.
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={handleRegister}>
            <Zap size={16} />
            Register Now
          </button>
        </div>
      </div>

      <div className="footer-base">
        <div className="container footer-base-inner">
          <span>
            &copy; {EVENT.year} {EVENT.name} — {EVENT.presenter}.
          </span>
          <span className="footer-base-tag">
            Event day {EVENT.time}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
