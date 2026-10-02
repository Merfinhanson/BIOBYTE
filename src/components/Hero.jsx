import React, { useCallback } from "react";
import { Clock, FileText, Trophy, Users, Zap } from "lucide-react";
import WarpText from "./WarpText";
import GradientWaves from "./GradientWaves";
import ScrollReveal from "./ScrollReveal";
import CardReveal from "./CardReveal";
import { EVENT } from "../data/site";
import { openRegisterGate } from "../utils/registerGate";
import { scrollToSection } from "../utils/scroll";
import "./Hero.css";

const CHIPS = [
  { icon: Clock, label: "Event Time", value: EVENT.time },
  { icon: Users, label: "Team Size", value: EVENT.teamSize },
  { icon: FileText, label: "Round 1", value: EVENT.roundOne },
  { icon: Trophy, label: "Round 2", value: EVENT.roundTwo },
];

const Hero = () => {
  const handleRegister = useCallback(() => {
    scrollToSection("register");
    openRegisterGate();
  }, []);

  return (
    <section id="top" className="hero-section">
      {/* Omnitrix energy field */}
      <div className="hero-waves" aria-hidden="true">
        <GradientWaves
          horizonColor="#050B06"
          waveColor="#7CFF00"
          crestColor="#B6FF5C"
          speed={0.28}
          amplitude={2.1}
          waveScale={0.72}
          waveRatio={0.95}
          swell={28}
          turbulence={16}
          tilt={1.06}
          zoom={1.05}
          height={5.0}
          fogDepth={12}
          detail="high"
          brightness={1.08}
          opacity={1}
          mouseInteraction
          parallaxStrength={0.35}
          grain
          grainIntensity={0.03}
        />
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-frame" aria-hidden="true" />

      <div className="hero-inner">
        <p className="hero-presenter">
          <span className="presenter-dot" aria-hidden="true" />
          {EVENT.presenter} presents
        </p>

        {/* ---------- warped title + neon omnitrix ring ---------- */}
        <div className="hero-title-stage">
          <div className="hero-omnitrix" aria-hidden="true">
            <span className="omni-glow" />
            <span className="omni-ring omni-ring-1" />
            <span className="omni-ring omni-ring-2" />
            <span className="omni-ring omni-ring-3" />
            <span className="omni-sweep" />
          </div>

          <h1 className="hero-title">
            <WarpText
              text="BIOBYTE"
              color="#7CFF00"
              warpStrength={0.075}
              warpScale={1.8}
              speed={0.5}
              pointerInfluence={0.38}
              pointerStrength={0.34}
              refraction={0.016}
              ripple
              fontSize={152}
              fontWeight={400}
              fontFamily="'Russo One', Impact, sans-serif"
              letterSpacing="0.02em"
              lineHeight={0.9}
              style={{ height: "clamp(230px, 36vw, 430px)" }}
            />
          </h1>
        </div>

        <ScrollReveal textClassName="hero-tagline">
          Activate Ideas. Transform Biology.
        </ScrollReveal>

        <ScrollReveal textClassName="hero-blurb">
          {EVENT.blurb}
        </ScrollReveal>

        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={handleRegister}>
            <Zap size={17} />
            Register Now
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => scrollToSection("problems")}
          >
            View Problem Statements
          </button>
        </div>

        <ul className="hero-chips">
          {CHIPS.map((chip) => (
            <CardReveal as="li" key={chip.label} className="hero-chip">
              <chip.icon size={14} aria-hidden="true" />
              <span className="chip-label">{chip.label}</span>
              <span className="chip-value">{chip.value}</span>
            </CardReveal>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="hero-scroll"
        onClick={() => scrollToSection("about")}
        aria-label="Scroll to About section"
      >
        <span className="hero-scroll-track" aria-hidden="true">
          <span className="hero-scroll-thumb" />
        </span>
        <span className="hero-scroll-label">Explore</span>
      </button>
    </section>
  );
};

export default Hero;
