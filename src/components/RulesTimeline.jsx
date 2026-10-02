import React from "react";
import {
  CircleCheckBig,
  Clock,
  FileText,
  Gift,
  Globe,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import CardReveal from "./CardReveal";
import { PROTOCOL, RULES } from "../data/site";
import "./RulesTimeline.css";

const RULE_ICONS = {
  globe: Globe,
  users: Users,
  gift: Gift,
  fileText: FileText,
  advance: CircleCheckBig,
  wallet: Wallet,
  clock: Clock,
};

const RulesTimeline = () => (
  <section id="timeline" className="section protocol-section">
    <CardReveal as="header" className="section-header">
      <span className="section-kicker">Rules &amp; Timeline</span>
      <h2 className="section-title">How It Works</h2>
      <div className="section-line" />
      <ScrollReveal textClassName="section-sub">
        Seven standing orders, then five stages from registration to the final demo. Follow the sequence and you stay eligible all the way through.
      </ScrollReveal>
    </CardReveal>

    <div className="protocol-grid">
      {/* ---------------- rules of engagement ---------------- */}
      <CardReveal className="rules-panel card bracket">
        <div className="rules-head">
          <span className="rules-icon" aria-hidden="true">
            <ShieldCheck size={20} />
          </span>
          <h3 className="rules-title">The Rules</h3>
        </div>

        <ul className="rules-list">
          {RULES.map((rule, index) => {
            const Icon = RULE_ICONS[rule.icon];
            return (
              <li key={rule.text} className="rule-item">
                <span className="rule-mark" aria-hidden="true">
                  <Icon size={15} />
                </span>
                <span className="rule-text">{rule.text}</span>
                <span className="rule-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </li>
            );
          })}
        </ul>
      </CardReveal>

      {/* ---------------- protocol flow ---------------- */}
      <div className="flow">
        <h3 className="flow-title">Round by Round</h3>

        <ol className="flow-list">
          {PROTOCOL.map((stage, index) => (
            <li key={stage.step} className="flow-step">
              <div className="flow-node" aria-hidden="true">
                <span>{stage.step}</span>
              </div>

              <CardReveal className="flow-body card">
                <h4 className="flow-step-title">{stage.title}</h4>
                <p className="flow-text">{stage.text}</p>
              </CardReveal>

              {index < PROTOCOL.length - 1 && (
                <span className="flow-link" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default RulesTimeline;
