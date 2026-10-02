import React from "react";
import "./Ticker.css";

const WORDS = [
  "Hackathons",
  "Workshops",
  "Seminars",
  "Tech Talks",
  "Biolabs",
  "Ideathons",
  "Demos",
  "Mentoring",
];

const strip = (className, items, label) => (
  <div className={`ticker ${className}`}>
    <span className="ticker-label">{label}</span>
    <div className="ticker-viewport">
      {/* The copy is duplicated so the loop has no visible seam. The
          duplicate is hidden from assistive tech. */}
      {[0, 1].map((copy) => (
        <ul className="ticker-run" key={copy} aria-hidden={copy === 1}>
          {items.map((word, i) => (
            <li className="ticker-word" key={`${copy}-${word}-${i}`}>
              {word}
            </li>
          ))}
        </ul>
      ))}
    </div>
  </div>
);

/**
 * Two counter-scrolling strips. This is the rhythm that makes the club
 * site feel alive rather than like a static poster.
 */
const Ticker = () => (
  <section className="ticker-section" aria-label="Club activity">
    {strip("ticker--forward", WORDS, "What we run")}
    {strip(
      "ticker--reverse",
      ["Every great event starts with an idea", "Have one?"],
      "Slogan",
    )}
  </section>
);

export default Ticker;