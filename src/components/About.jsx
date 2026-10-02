import React from "react";
import { Compass, Cpu, Dna, Sparkles } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import CardReveal from "./CardReveal";
import { EVENT, PILLARS } from "../data/site";
import "./About.css";

const ICONS = {
  compass: Compass,
  dna: Dna,
  cpu: Cpu,
  spark: Sparkles,
};

const About = () => {
  return (
    <section id="about" className="section section--airy about-section">
      <CardReveal as="header" className="section-header">
        <span className="section-kicker">About</span>
        <h2 className="section-title">Mission Brief</h2>
        <div className="section-line" />
        <ScrollReveal textClassName="section-sub">
          {`BIOBYTE is a single-day biotechnology hackathon by ${EVENT.presenter}. Teams of two to four take one real challenge from bioprocess, bio-imaging, environmental sensing or drug discovery — and turn it into software that runs. One day, one track, one working outcome.`}
        </ScrollReveal>
      </CardReveal>

      <div className="pillars-grid">
        {PILLARS.map((pillar, index) => {
          const Icon = ICONS[pillar.icon];
          return (
            <CardReveal
              as="article"
              key={pillar.key}
              className="pillar card bracket glow-box-hover"
            >
              <span className="pillar-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="pillar-icon" aria-hidden="true">
                <Icon size={26} />
              </span>

              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-text">{pillar.text}</p>
            </CardReveal>
          );
        })}
      </div>
    </section>
  );
};

export default About;
