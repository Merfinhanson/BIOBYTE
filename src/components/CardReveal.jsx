import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CardReveal = ({ children, className = '', as: Component = 'div', ...props }) => {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 40, filter: 'blur(8px)', rotateX: 5 },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        rotateX: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top center',
          scrub: 1,
        }
      }
    );
  }, []);

  return (
    <Component ref={elRef} className={`card-reveal ${className}`} {...props}>
      {children}
    </Component>
  );
};

export default CardReveal;
