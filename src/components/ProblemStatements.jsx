import React, { useCallback, useState } from "react";
import MissionCard from "./MissionCard";
import MissionModal from "./MissionModal";
import Reveal from "./Reveal";
import ScrollReveal from "./ScrollReveal";
import { PROBLEMS } from "../data/site";
import "./ProblemStatements.css";

const ProblemStatements = () => {
  const [active, setActive] = useState(null);

  const close = useCallback(() => setActive(null), []);

  return (
    <section id="problems" className="section problems-section">
      <header className="section-header">
        <span className="section-kicker">Challenge Files</span>
        <h2 className="section-title">Pick Your Mission</h2>
        <div className="section-line" />
        <ScrollReveal textClassName="section-sub">
          Five official problem statements. Open one mission file at a time — your
          registration stays locked to the track you pick.
        </ScrollReveal>
      </header>

      <div className="mission-grid">
        {PROBLEMS.map((problem, index) => (
          <Reveal key={problem.id} className="mission-reveal" delay={index * 110}>
            <MissionCard problem={problem} onOpen={setActive} />
          </Reveal>
        ))}
      </div>

      <MissionModal problem={active} onClose={close} />
    </section>
  );
};

export default ProblemStatements;