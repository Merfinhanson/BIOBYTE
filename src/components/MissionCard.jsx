import React, { useCallback, useRef, useState } from "react";
import { FileText } from "lucide-react";
import OmnitrixRing from "./OmnitrixRing";
import WordReveal from "./WordReveal";

/**
 * One alien mission file. The card is a sealed brief: it shows the
 * track code, the alien alias, the one-line mission and the tag chips.
 * Everything else lives in the MissionModal, one statement at a time.
 */
const MissionCard = ({ problem, onOpen }) => {
  const [ripple, setRipple] = useState(null);
  const rippleCount = useRef(0);

  const handlePointerMove = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  const handleRipple = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    rippleCount.current += 1;
    setRipple({
      key: rippleCount.current,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  return (
    <article
      className="mission-card bracket"
      style={{ "--hue": problem.hue, "--hue-deep": problem.hueDeep }}
      onPointerMove={handlePointerMove}
      onPointerDown={handleRipple}
    >
      <span className="mission-scan" aria-hidden="true" />
      <span className="mission-pulse" aria-hidden="true" />
      {ripple ? (
        <span
          key={ripple.key}
          className="mission-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      ) : null}

      <OmnitrixRing hue={problem.hue} className="mission-ring" />

      <div className="mission-top">
        <span className="mission-code">[{problem.id}]</span>
        <span className="mission-alien">{problem.alien}</span>
        <span className="mission-clearance">Mission file</span>
      </div>

      <div className="mission-lead">
        <span className="mission-emblem" style={{ color: problem.hue }} aria-hidden="true">
          {problem.icon}
        </span>

        <div className="mission-lead-text">
          <h3 className="mission-title">{problem.title}</h3>
          <WordReveal className="mission-brief" stagger={42}>
            {problem.brief}
          </WordReveal>
        </div>
      </div>

      <ul className="mission-tags">
        {problem.tags.map((tag) => (
          <li className="tag-chip" key={tag}>
            {tag}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mission-open"
        onClick={() => onOpen(problem)}
      >
        <FileText size={15} aria-hidden="true" />
        Open statement
      </button>
    </article>
  );
};

export default MissionCard;