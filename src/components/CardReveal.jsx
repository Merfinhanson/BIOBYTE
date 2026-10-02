import React from "react";
import Reveal from "./Reveal";

/**
 * Card-sized reveal. Thin wrapper over Reveal so every entrance on the
 * site shares one animation, one cleanup path and one reduced-motion
 * guard. Previously this ran its own gsap.fromTo with no revert,
 * which leaked a ScrollTrigger for every card ever mounted.
 */
const CardReveal = ({ children, className = "", as: Component = "div", ...props }) => (
  <Reveal as={Component} className={`card-reveal ${className}`.trim()} y={40} blur={8} {...props}>
    {children}
  </Reveal>
);

export default CardReveal;