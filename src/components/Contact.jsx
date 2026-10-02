import React from "react";
import { Landmark, Phone, Radio, Users } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import CardReveal from "./CardReveal";
import { CONVENORS, COORDINATORS, EVENT } from "../data/site";
import "./Contact.css";

const Contact = () => (
  <section id="contact" className="section section--airy contact-section">
    <CardReveal as="header" className="section-header">
      <span className="section-kicker">Contact</span>
      <h2 className="section-title">Command Center</h2>
      <div className="section-line" />
      <ScrollReveal textClassName="section-sub">
        {`For registration queries, challenge clarification or event-day support, reach the ${EVENT.presenter} core team directly.`}
      </ScrollReveal>
    </CardReveal>

    <div className="command-grid">
      {/* ---------------- coordinators ---------------- */}
      <div className="command-block">
        <div className="command-head">
          <span className="command-badge">
            <Users size={16} aria-hidden="true" />
            Core Team
          </span>
          <h3 className="command-title">Coordinators</h3>
        </div>

        <div className="people-grid">
          {COORDINATORS.map((person) => (
            <CardReveal as="article" key={person.name} className="person card bracket glow-box-hover">
              <span className="person-role">{person.role}</span>
              <h4 className="person-name">{person.name}</h4>
              <a className="person-phone" href={`tel:+91${person.phone}`}>
                <Phone size={14} aria-hidden="true" />
                +91 {person.phone}
              </a>
            </CardReveal>
          ))}
        </div>
      </div>

      {/* ---------------- convenors ---------------- */}
      <div className="command-block">
        <div className="command-head">
          <span className="command-badge command-badge-amber">
            <Landmark size={16} aria-hidden="true" />
            Faculty
          </span>
          <h3 className="command-title">Convenors</h3>
        </div>

        <div className="people-grid">
          {CONVENORS.map((person) => (
            <CardReveal as="article" key={person.name} className="person card bracket glow-box-hover">
              <span className="person-role">{person.role}</span>
              <h4 className="person-name">{person.name}</h4>
            </CardReveal>
          ))}
        </div>
      </div>
    </div>

    <p className="command-note">
      <Radio size={14} aria-hidden="true" />
      Comms open {EVENT.time} on event day
    </p>
  </section>
);

export default Contact;
