import React from "react";
import Reveal from "./Reveal";
import "./Motion.css";

/**
 * Grouped reveal: every <RevealItem /> inside staggers in on one trigger.
 */
const RevealGroup = ({
  as: Tag = "div",
  className = "",
  stagger = 0.09,
  children,
  ...rest
}) => (
  <Reveal
    as={Tag}
    className={`reveal-group ${className}`.trim()}
    stagger={stagger}
    {...rest}
  >
    {children}
  </Reveal>
);

/** Marks a child of RevealGroup as one step of the stagger. */
export const RevealItem = ({ as: Tag = "div", children, ...rest }) => (
  <Tag data-reveal-item="" {...rest}>
    {children}
  </Tag>
);

export default RevealGroup;