/*
 * Reveal.jsx — Scroll-triggered entrance animation wrapper.
 *
 * Renders a container that stays hidden (via the [data-reveal] CSS rule) until
 * it scrolls into the viewport, then fades and slides into place. Uses a single
 * IntersectionObserver per instance and reveals once. Accepts `delay` (ms) for
 * staggering sequences and `as` to choose the rendered element. Honours
 * prefers-reduced-motion automatically through the global CSS guard.
 */
import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal
      data-show={show ? 'true' : 'false'}
      style={{ transitionDelay: show ? `${delay}ms` : '0ms' }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
