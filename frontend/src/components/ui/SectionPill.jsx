/*
 * SectionPill.jsx — Small decorative label pill for section headings.
 *
 * Renders a styled inline pill with an optional icon (defaults to the Sparkles
 * icon) and text children. Uses the .section-pill CSS class from the design
 * system for consistent teal border and background styling. Used as a visual
 * sub-header on landing page sections and marketing blocks.
 */
import { Sparkles } from 'lucide-react';

export default function SectionPill({ children, icon }) {
  return (
    <span className="section-pill">
      {icon || <Sparkles size={12} />}
      {children}
    </span>
  );
}
