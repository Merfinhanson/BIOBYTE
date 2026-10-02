import React, { useEffect, useState } from "react";
import { SPLASH_MS } from "../data/site";
import "./SplashScreen.css";

const BOOT_LINES = [
  "INITIALISING OMNITRIX CORE",
  "LOADING BIOBYTE",
  "READY TO BUILD",
];

/* Deterministic spark field — no Math.random during render */
const SPARKS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 61) % 100}%`,
  delay: `${((i % 9) * 0.37).toFixed(2)}s`,
  duration: `${(4 + (i % 5) * 0.9).toFixed(2)}s`,
  size: i % 4 === 0 ? 4 : 2,
}));

const SplashScreen = ({ phase }) => {
  const [percent, setPercent] = useState(0);

  /* Countdown to 100, driven by rAF and hard-clamped so it cannot overrun */
  useEffect(() => {
    const started = performance.now();
    let frame;

    const tick = (now) => {
      const next = Math.min(100, Math.round(((now - started) / SPLASH_MS) * 100));
      setPercent(next);
      if (next < 100) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`splash-screen ${phase === "exiting" ? "is-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading BIOBYTE"
    >
      {/* ambient field */}
      <div className="splash-sparks" aria-hidden="true">
        {SPARKS.map((spark, i) => (
          <span
            key={i}
            className="splash-spark"
            style={{
              left: spark.left,
              top: spark.top,
              width: spark.size,
              height: spark.size,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
      </div>
      <div className="splash-scan" aria-hidden="true" />
      <div className="splash-vignette" aria-hidden="true" />

      {/* omnitrix core */}
      <div className="splash-core" aria-hidden="true">
        <span className="core-halo" />
        <span className="core-pulse core-pulse-a" />
        <span className="core-pulse core-pulse-b" />
        <span className="core-ring core-ring-outer" />
        <span className="core-ring core-ring-mid" />
        <span className="core-ring core-ring-inner" />
        <span className="core-dot" />
      </div>

      {/* console */}
      <div className="splash-content">
        <p className="splash-presenter">Crescent Technocrats Club presents</p>

        <h1 className="splash-title">
          <span className="splash-title-base" data-text="BIOBYTE">
            BIOBYTE
          </span>
        </h1>

        <p className="splash-tagline">Activate Ideas. Transform Biology.</p>

        <ul className="splash-log">
          {BOOT_LINES.map((line, i) => (
            <li key={line} style={{ animationDelay: `${0.35 + i * 0.5}s` }}>
              <span className="log-tick">&gt;</span> {line}
            </li>
          ))}
        </ul>

        <div className="splash-progress" aria-hidden="true">
          <span className="progress-fill" />
        </div>

        <p className="splash-meta">
          <span>CORE CHARGING</span>
          <span className="splash-percent">{String(percent).padStart(3, "0")}%</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
