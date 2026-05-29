/*
 * MiniLineChart.jsx — Lightweight SVG multi-series line chart component.
 *
 * Renders an inline SVG chart with auto-scaled Y axis, grid lines, month
 * labels on the X axis, a semi-transparent area fill, smooth polyline strokes,
 * and dot markers per data point for each series. No external charting
 * library dependency. Accepts series (name, color, data[]) and months arrays.
 */
/** Simple SVG line chart — no external dependencies */
export default function MiniLineChart({ series = [], months = [], height = 180 }) {
  if (!series.length || !months.length) return null;

  const allValues = series.flatMap((s) => s.data);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range  = maxVal - minVal || 1;

  const W = 520;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;

  function xPos(i) { return PAD.left + (i / (months.length - 1)) * chartW; }
  function yPos(v) { return PAD.top + chartH - ((v - minVal) / range) * chartH; }

  // Y-axis ticks
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) =>
    minVal + (range / ticks) * i
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Chart"
    >
      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={yPos(tick)}
            x2={W - PAD.right} y2={yPos(tick)}
            stroke="#e2e8f0" strokeWidth="1"
          />
          <text
            x={PAD.left - 6} y={yPos(tick) + 4}
            textAnchor="end" fontSize="10" fill="#94a3b8"
          >
            {Math.round(tick)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {months.map((m, i) => (
        <text
          key={m}
          x={xPos(i)} y={H - 8}
          textAnchor="middle" fontSize="10" fill="#94a3b8"
        >
          {m}
        </text>
      ))}

      {/* Series lines + dots */}
      {series.map((s) => {
        const pts = s.data.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
        const area = [
          `M ${xPos(0)} ${yPos(s.data[0])}`,
          ...s.data.slice(1).map((v, i) => `L ${xPos(i + 1)} ${yPos(v)}`),
          `L ${xPos(s.data.length - 1)} ${PAD.top + chartH}`,
          `L ${xPos(0)} ${PAD.top + chartH}`,
          'Z',
        ].join(' ');

        return (
          <g key={s.name}>
            {/* Area fill */}
            <path d={area} fill={s.color} fillOpacity="0.08" />
            {/* Line */}
            <polyline
              points={pts}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {s.data.map((v, i) => (
              <circle
                key={i}
                cx={xPos(i)} cy={yPos(v)}
                r="4" fill={s.color} stroke="white" strokeWidth="2"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
