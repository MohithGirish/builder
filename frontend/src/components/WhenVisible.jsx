/*
 * WhenVisible.jsx — Defer rendering of heavy children until they scroll near
 * the viewport.
 *
 * Renders `placeholder` (which should reserve the final height to avoid layout
 * shift) until an IntersectionObserver reports the wrapper is within
 * `rootMargin` of the viewport, then swaps in `children`. Keeps below-the-fold
 * widgets — e.g. the Leaflet map and its tile requests — out of the initial
 * page load. Falls back to rendering immediately where IntersectionObserver is
 * unavailable. By default it only fires once (children stay mounted after).
 */
import { useEffect, useRef, useState } from 'react';

export default function WhenVisible({ children, placeholder = null, rootMargin = '200px', once = true }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        if (once) io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin, once]);

  return <div ref={ref}>{visible ? children : placeholder}</div>;
}
