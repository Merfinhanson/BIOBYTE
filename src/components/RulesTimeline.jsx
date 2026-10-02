import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import { prefersReducedMotion } from "../utils/motion";
import { PROTOCOL, RULES } from "../data/site";
import "./RulesTimeline.css";

gsap.registerPlugin(ScrollTrigger);

const RULE_ICONS = {
  globe: Globe,
  users: Users,
  gift: Gift,
  fileText: FileText,
  advance: CircleCheckBig,
  wallet: Wallet,
  clock: Clock,
};

const RulesTimeline = () => {
  const sectionRef = useRef(null);
  const flowRef = useRef(null);
  const trackRef = useRef(null);
  const fillRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const flow = flowRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!section || !flow || !track || !fill) return undefined;

    const steps = gsap.utils.toArray(".flow-step", flow);
    if (!steps.length) return undefined;

    /* Reduced motion: show the spine fully lit and every step resolved. */
    if (prefersReducedMotion()) {
      gsap.set(fill, { scaleY: 1 });
      steps.forEach((step) => step.classList.add("is-complete"));
      return undefined;
    }

    const ctx = gsap.context(() => {
      const first = steps[0];
      const last = steps[steps.length - 1];

      /* Rail runs node-centre to node-centre, so the fill always lines up
         with the circles instead of the card edges. */
      const centreIn = (el) => {
        const box = el.getBoundingClientRect();
        return box.top + box.height / 2 - flow.getBoundingClientRect().top;
      };

      const railTop = centreIn(first);
      const railBottom = centreIn(last);

      gsap.set(track, { top: railTop, height: Math.max(0, railBottom - railTop) });
      gsap.set(fill, { scaleY: 0, transformOrigin: "top center" });

      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 68%",
            end: "bottom 72%",
            scrub: 0.55,
          },
        },
      );

      steps.forEach((step) => {
        const card = step.querySelector(".flow-body");

        /* Scroll-linked card arrival: blurred and low, resolving as the
           step reaches the middle of the viewport. */
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 34, filter: "blur(7px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              ease: "none",
              scrollTrigger: {
                trigger: step,
                start: "top bottom",
                end: "top 58%",
                scrub: 0.5,
              },
              onComplete: () => gsap.set(card, { clearProps: "filter,transform,opacity" }),
            },
          );
        }

        ScrollTrigger.create({
          trigger: step,
          start: "top 70%",
          end: "bottom 34%",
          onToggle: (self) => step.classList.toggle("is-active", self.isActive),
          onEnter: () => step.classList.add("is-complete"),
          onEnterBack: () => step.classList.add("is-complete"),
          onLeaveBack: () => step.classList.remove("is-complete"),
        });
      });
    }, section);

    /* Web fonts and the page-bg morph both change node offsets after mount,
       so re-measure once things have settled. */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(section);

    return () => {
      window.removeEventListener("load", refresh);
      resizeObserver.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section id="timeline" ref={sectionRef} className="section protocol-section">
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
        <div className="flow" ref={flowRef}>
          <h3 className="flow-title">Round by Round</h3>

          <span className="flow-track" ref={trackRef} aria-hidden="true">
            <span className="flow-fill" ref={fillRef} />
          </span>

          <ol className="flow-list">
            {PROTOCOL.map((stage, index) => (
              <li key={stage.step} className="flow-step">
                <div className="flow-node" aria-hidden="true">
                  <span>{stage.step}</span>
                </div>

                <div className="flow-body card">
                  <h4 className="flow-step-title">{stage.title}</h4>
                  <p className="flow-text">{stage.text}</p>
                </div>

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
};

export default RulesTimeline;