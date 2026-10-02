import React, { useCallback } from "react";
import { CalendarClock, CalendarRange, Layers, Zap } from "lucide-react";
import Countdown from "./Countdown";
import Reveal from "./Reveal";
import { EVENT, PROBLEMS } from "../data/site";
import { openRegisterGate } from "../utils/registerGate";
import { scrollToSection } from "../utils/scroll";
import "./FeaturedMission.css";

/**
 * The one card the club site leads with: what the event is, when it
 * runs, and three ways in. Sits directly under the hero.
 */
const FeaturedMission = () => {
  const handleRegister = useCallback(() => {
    scrollToSection("register");
    openRegisterGate();
  }, []);

  return (
    <section className="featured" aria-labelledby="featured-title">
      <Reveal className="featured-shell">
        <div className="featured-head">
          <span className="featured-badge">
            <Layers size={13} aria-hidden="true" />
            Featured mission
          </span>
          <span className="featured-meta">
            {PROBLEMS.length} tracks · {EVENT.time}
          </span>
        </div>

        <div className="featured-body">
          <div className="featured-copy">
            <h2 className="featured-title" id="featured-title">
              {EVENT.name} <span className="featured-year">{EVENT.year}</span>
            </h2>
            <p className="featured-line">{EVENT.tagline}</p>
            <p className="featured-blurb">{EVENT.blurb}</p>

            <div className="featured-venue">
              <CalendarClock size={14} aria-hidden="true" />
              {EVENT.venue}
            </div>
          </div>

          <div className="featured-clock">
            <span className="featured-clock-key">Countdown</span>
            <Countdown target={EVENT.date} />
          </div>
        </div>

        <div className="featured-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => scrollToSection("problems")}
          >
            <Layers size={15} aria-hidden="true" />
            View details
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => scrollToSection("timeline")}
          >
            <CalendarRange size={15} aria-hidden="true" />
            Full schedule
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleRegister}>
            <Zap size={15} aria-hidden="true" />
            Register now
          </button>
        </div>
      </Reveal>
    </section>
  );
};

export default FeaturedMission;