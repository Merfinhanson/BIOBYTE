import React, { useEffect, useRef, useState } from "react";
import "./WordReveal.css";

/* Resolved once: without IntersectionObserver the text just renders. */
const CAN_OBSERVE = typeof IntersectionObserver !== "undefined";

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fades text in word by word the first time it scrolls into view.
 * Used for the one-line mission briefs on the challenge cards.
 */
const WordReveal = ({
  as: Tag = "span",
  className = "",
  stagger = 55,
  delay = 0,
  children,
}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(!CAN_OBSERVE || prefersReducedMotion());

  useEffect(() => {
    if (shown) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  const words = String(children).split(" ");

  return (
    <Tag
      ref={ref}
      className={`word-reveal ${shown ? "is-revealed" : ""} ${className}`.trim()}
    >
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span
            className="wr-word"
            style={{ transitionDelay: `${delay + i * stagger}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default WordReveal;