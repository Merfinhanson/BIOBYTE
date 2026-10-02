import React, { useEffect, useRef, useState } from "react";

/* Resolved once: in browsers without IntersectionObserver, content simply
   renders in its final state instead of animating. */
const CAN_OBSERVE = typeof IntersectionObserver !== "undefined";

/**
 * Fades content up the first time it enters the viewport.
 * Self-contained so it also works for lazily loaded sections.
 */
const Reveal = ({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
  ...rest
}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(!CAN_OBSERVE);

  useEffect(() => {
    if (shown) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "is-revealed" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
