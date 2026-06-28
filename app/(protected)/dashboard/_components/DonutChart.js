"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Dependency-free SVG donut chart. Renders the ring with a percentage label at
 * each slice's midpoint plus a legend on the right (matching the Performance
 * mock). Slices with a zero value are dropped from the ring but kept in the
 * legend so the category list stays stable across selections.
 *
 * `segments`: `[{ label, value, color }]`. Pure presentational — the caller
 * shapes the data (job-health counts, pipeline buckets, …).
 */
// Coordinate space (CANVAS) is larger than the ring so the outside percentage
// labels never clip; the <svg> renders down to DISPLAY px.
const CANVAS = 270;
const DISPLAY = 210;
const CENTER = CANVAS / 2;
const THICKNESS = 26;
const RADIUS = 82;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// White separator between adjacent slices, in user-space units along the arc.
const GAP = 3;
const LABEL_RADIUS = RADIUS + THICKNESS / 2 + 12;

/** Polar (radians, 0 = top, clockwise) → SVG cartesian point. */
const polarToXY = (angle, radius) => ({
  x: CENTER + radius * Math.cos(angle - Math.PI / 2),
  y: CENTER + radius * Math.sin(angle - Math.PI / 2),
});

const DonutChart = ({ segments }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // Build the drawable arcs (value > 0) with cumulative offsets + label points.
  let acc = 0;
  const arcs = total
    ? segments
        .filter((s) => s.value > 0)
        .map((s) => {
          const fraction = s.value / total;
          const startFraction = acc;
          acc += fraction;
          const dash = Math.max(0, fraction * CIRCUMFERENCE - GAP);
          const midAngle = (startFraction + fraction / 2) * 2 * Math.PI;
          return {
            ...s,
            dash,
            offset: -startFraction * CIRCUMFERENCE,
            pct: Math.round(fraction * 100),
            label_point: polarToXY(midAngle, LABEL_RADIUS),
          };
        })
    : [];

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 2, sm: 4 }}
      sx={{ alignItems: "center", justifyContent: "center", width: "100%", py: 1 }}
    >
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <svg width={DISPLAY} height={DISPLAY} viewBox={`0 0 ${CANVAS} ${CANVAS}`} role="img">
          {total === 0 ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="rgba(19,64,45,0.08)"
              strokeWidth={THICKNESS}
            />
          ) : (
            <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
              {arcs.map((a) => (
                <circle
                  key={a.label}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={THICKNESS}
                  strokeDasharray={`${a.dash} ${CIRCUMFERENCE - a.dash}`}
                  strokeDashoffset={a.offset}
                />
              ))}
            </g>
          )}
          {arcs.map((a) => (
            <text
              key={`${a.label}-pct`}
              x={a.label_point.x}
              y={a.label_point.y}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontWeight: 700, fontSize: 21, fill: "#13402d" }}
            >
              {a.pct}%
            </text>
          ))}
        </svg>
        {total === 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            No data
          </Typography>
        )}
      </Box>

      <Stack spacing={1.25} sx={{ minWidth: 120 }}>
        {segments.map((s) => (
          <Stack key={s.label} direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: s.color, flexShrink: 0 }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {s.label}
              <Box component="span" sx={{ ml: 0.75, fontWeight: 700, color: "text.primary" }}>
                {s.value}
              </Box>
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default DonutChart;
