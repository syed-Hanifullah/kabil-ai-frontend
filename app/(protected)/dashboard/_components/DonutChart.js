"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Dependency-free SVG donut chart. Renders the ring with a percentage label sat
 * on each slice's band plus a legend on the right. Slices with a zero value are
 * dropped from the ring but kept in the legend so the category list stays stable
 * across selections.
 *
 * `segments`: `[{ label, value, color }]`. Pure presentational — the caller
 * shapes the data (job-health counts, pipeline buckets, …).
 */
// Coordinate space. Labels now sit inside the ring band, so the canvas only has
// to hold the ring itself (outer radius = RADIUS + THICKNESS / 2) plus a small
// margin; the <svg> renders it down to DISPLAY px.
const THICKNESS = 26;
const RADIUS = 82;
const CANVAS = 2 * (RADIUS + THICKNESS / 2) + 8;
const DISPLAY = 210;
const CENTER = CANVAS / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// White separator between adjacent slices, in user-space units along the arc.
const GAP = 3;
// Percentage labels ride the centerline of the band; slices thinner than this
// fraction of the ring are left unlabelled so the text never overflows the arc.
const MIN_LABEL_FRACTION = 0.06;

/** Polar (radians, 0 = top, clockwise) → SVG cartesian point. */
const polarToXY = (angle, radius) => ({
  x: CENTER + radius * Math.cos(angle - Math.PI / 2),
  y: CENTER + radius * Math.sin(angle - Math.PI / 2),
});

/** Pick dark or white label text for legibility against a slice's fill. */
const labelColor = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#13402d" : "#ffffff";
};

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
            showLabel: fraction >= MIN_LABEL_FRACTION,
            label_point: polarToXY(midAngle, RADIUS),
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
          {arcs
            .filter((a) => a.showLabel)
            .map((a) => (
              <text
                key={`${a.label}-pct`}
                x={a.label_point.x}
                y={a.label_point.y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontWeight: 700, fontSize: 15, fill: labelColor(a.color) }}
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
