/*
 * StarRating.jsx — Compact star rating display component.
 *
 * Renders a single filled amber star icon followed by the numeric rating
 * value. The icon size is configurable via the size prop (default 12).
 * Used in builder cards and builder feed cards to display quality ratings.
 */
import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 12 }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star size={size} className="text-amber-400 fill-amber-400" />
      <span className="text-xs font-semibold text-slate-700 ml-0.5">{rating}</span>
    </span>
  );
}
