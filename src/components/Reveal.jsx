import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ITEM_SELECTOR, prefersReducedMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared scroll-reveal primitive for the whole site.
 *
 * One element      -> fades the wrapper up.
 * data-reveal-item -> staggers every marked child instead.
 *
 * `delay` stays in milliseconds so existing call sites
 * (delay={index * 120}) keep working unchanged.
 */
const Reveal = ({
  as: Tag = "div",
  className = "",
  delay = 0,
  y = 26,
  blur = 6,
  duration = 0.85,
  stagger = 0.09,
  start = "top bottom-=12%",
  once = true,
  children,
  ...rest
}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const items = el.querySelectorAll(ITEM_SELECTOR);
    const targets = items.length ? items : [el];

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y, filter: `blur(${blur}px)` });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration,
        delay: delay / 1000,
        ease: "power3.out",
        stagger: items.length ? stagger : 0,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
        onComplete: () => gsap.set(targets, { clearProps: "opacity,transform,filter" }),
      });
    }, el);

    return () => ctx.revert();
  }, [delay, y, blur, duration, stagger, start, once]);

  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;