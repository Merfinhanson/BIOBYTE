import React, { useState } from "react";
import RewardPod from "./RewardPod";
import Reveal from "./Reveal";
import ScrollReveal from "./ScrollReveal";
import { PRIZES } from "../data/site";
import "./Prizes.css";

const Prizes = () => {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => setOpenId((current) => (current === id ? null : id));

  return (
    <section id="prizes" className="section section--tight prizes-section">
      <header className="section-header is-centered">
        <span className="section-kicker">Mission Rewards</span>
        <h2 className="section-title">Prize Vault</h2>
        <div className="section-line" />
        <ScrollReveal textClassName="section-sub">
          Three reward pods are sealed for Round 2. Open a pod to see what
          your track is competing for.
        </ScrollReveal>
      </header>

      <div className="pod-grid">
        {PRIZES.map((prize, index) => (
          <Reveal key={prize.id} className="pod-reveal" delay={index * 120}>
            <RewardPod
              prize={prize}
              index={index}
              isOpen={openId === prize.id}
              onToggle={() => handleToggle(prize.id)}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Prizes;