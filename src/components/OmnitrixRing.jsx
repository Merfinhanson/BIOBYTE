import React from "react";

/**
 * Omnitrix-style mission mark: two counter-rotating dashed rings
 * around a solid core. Pure CSS animation, no canvas needed.
 */
const OmnitrixRing = ({ hue = "#7CFF00", className = "" }) => (
  <svg
    className={`omnitrix-ring ${className}`.trim()}
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
  >
    <g className="ring-spin">
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke={hue}
        strokeWidth="2"
        strokeDasharray="12 16"
        opacity="0.75"
      />
    </g>

    <g className="ring-spin-rev">
      <circle
        cx="50"
        cy="50"
        r="37"
        fill="none"
        stroke={hue}
        strokeWidth="1.5"
        strokeDasharray="5 12"
        opacity="0.5"
      />
    </g>

    <circle
      cx="50"
      cy="50"
      r="27"
      fill="none"
      stroke={hue}
      strokeWidth="2.5"
      opacity="0.6"
    />

    {/* Core */}
    <path d="M50 25 L62 51 L50 77 L38 51 Z" fill={hue} opacity="0.9" />
    <circle cx="50" cy="51" r="4.5" className="ring-core" />
  </svg>
);

export default OmnitrixRing;