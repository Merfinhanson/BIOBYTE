import React, { useCallback, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import OmnitrixRing from "./OmnitrixRing";

/**
 * A sealed reward pod. Idle it floats with a slow energy drift.
 * Opened (hover, focus or tap) the lid splits, a ring pulse fires and
 * the payout is revealed.
 */
const RewardPod = ({ prize, index, isOpen, onToggle }) => {
  const panelId = `pod-panel-${prize.id}`;
  const [flashKey, setFlashKey] = useState(0);
  const sparkCount = useRef(0);

  const handleOpen = useCallback(() => {
    if (isOpen) return;
    sparkCount.current += 1;
    setFlashKey(sparkCount.current);
    onToggle();
  }, [isOpen, onToggle]);

  const sparks = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div
      className={`reward-pod ${isOpen ? "is-open" : ""}`}
      style={{
        "--hue": index === 0 ? "#7CFF00" : index === 1 ? "#B6FF5C" : "#2EE6D6",
        "--pod-drift": `${index * 1.1}s`,
      }}
    >
      <button
        type="button"
        className="pod-trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleOpen}
      >
        {/* Flash + ring pulse, re-keyed on every open */}
        <span className="pod-flash" key={`flash-${flashKey}`} aria-hidden="true" />
        <span className="pod-wave" key={`wave-${flashKey}`} aria-hidden="true" />
        <span className="pod-sparks" aria-hidden="true">
          {isOpen
            ? sparks.map((i) => <i key={i} />)
            : null}
        </span>

        <span className="pod-art" aria-hidden="true">
          <span className="pod-lid" />
          <span className="pod-body">
            <OmnitrixRing hue="currentColor" className="pod-ring" />
            <span className="pod-place">{prize.place}</span>
          </span>
          <span className="pod-base" />
        </span>

        <span className="pod-name">{prize.podName}</span>
        <span className="pod-state">
          <Sparkles size={12} aria-hidden="true" />
          {isOpen ? "Pod open" : "Tap to open"}
        </span>
      </button>

      <div className="pod-panel" id={panelId} hidden={!isOpen}>
        <p className="pod-amount">{prize.amount}</p>
        <h3 className="pod-title">{prize.title}</h3>
        <p className="pod-text">{prize.text}</p>
      </div>
    </div>
  );
};

export default RewardPod;