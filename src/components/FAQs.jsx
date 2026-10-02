import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import CardReveal from "./CardReveal";
import { FAQS } from "../data/site";
import "./FAQs.css";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="section section--tight faq-section">
      <CardReveal as="header" className="section-header">
        <span className="section-kicker">FAQ</span>
        <h2 className="section-title">FAQ</h2>
        <div className="section-line" />
      </CardReveal>

      <div className="faq-list">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <CardReveal
              key={faq.q}
              className={`faq-item card ${isOpen ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className="faq-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-text">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`faq-chevron ${isOpen ? "is-open" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <div
                id={`faq-answer-${index}`}
                className="faq-answer"
                role="region"
                hidden={!isOpen}
              >
                <p>{faq.a}</p>
              </div>
            </CardReveal>
          );
        })}
      </div>
    </section>
  );
};

export default FAQs;
