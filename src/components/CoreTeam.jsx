import React from "react";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import ScrollReveal from "./ScrollReveal";
import { CORE_TEAM } from "../data/site";
import "./CoreTeam.css";

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const CoreTeam = () => (
  <section id="core-team" className="section core-team-section">
    <header className="section-header is-centered">
      <span className="section-kicker">Command Crew</span>
      <h2 className="section-title">Student Core Team</h2>
      <div className="section-line" />
      <ScrollReveal textClassName="section-sub">
        The students building BIOBYTE behind the scenes — tech, operations and
        event day logistics.
      </ScrollReveal>
    </header>

    <div className="crew-grid">
      {CORE_TEAM.map((member, index) => (
        <Reveal key={member.handle} className="crew-reveal" delay={index * 120}>
          <article
            className="crew-card"
            style={{ "--hue": member.hue }}
          >
            <header className="crew-top">
              <span className="crew-badge">{member.badge}</span>
              <span className="crew-label">Mission crew</span>
            </header>

            <div className="crew-lead">
              {/* Initials avatar: public/ has no team photos yet, so this
                  avoids broken images. Swap for <img> when they land. */}
              <span className="crew-avatar" aria-hidden="true">
                <span className="crew-initials">{initials(member.name)}</span>
              </span>

              <div className="crew-ident">
                <h3 className="crew-name">{member.name}</h3>
                <p className="crew-title">{member.title}</p>
                <p className="crew-handle">@{member.handle}</p>
              </div>
            </div>

            <div className="crew-status">
              <span className="crew-status-key">Status</span>
              <span className="crew-status-value">
                <span className="crew-dot" aria-hidden="true" />
                {member.status}
              </span>
            </div>

            {/* No profile pages exist yet, so this routes to the Contact
                section where the full crew details are listed. Swap for a
                real /team route once profiles exist. */}
            <a className="crew-link" href="#contact">
              View profile
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </article>
        </Reveal>
      ))}
    </div>
  </section>
);

export default CoreTeam;