"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  PS_COLORS,
  PS_HEADER,
  PS_ITEMS,
  PS_LAYOUT,
  PS_LEFT_IMAGE,
  PS_LEFT_IMAGE_2,
  PS_RIGHT_IMAGE,
  PS_RIGHT_IMAGE_2,
  PS_TYPOGRAPHY,
} from "@/lib/kabil/landing";

// Outlined number: Space Grotesk (from spec) rendered as a transparent-fill
// glyph with a 1.5px stroke.
const NUMBER_STYLE = {
  ...PS_TYPOGRAPHY.number,
  color: "transparent",
  WebkitTextStroke: `1.5px ${PS_COLORS.numberStroke}`,
};

// Connector line — DERIVED from the Figma image (exact spec pending). Drawn as
// an SVG (not an image): a stepped line from the problem card's right edge down
// to the solution card's left edge, with a filled dot at each end.
const CONNECTOR = {
  color: "rgba(20, 20, 20, 1)",
  width: 2, // px stroke
  dot: 10, // px diameter
  gap: 14, // px — spacing between the dot and the card edge
  // Vertical band (relative to the row): top = problem card center,
  // top+height = solution card center, so each dot lands on a card's center.
  top: 189, // px from row top to the start dot (problem card center)
  height: 110, // px down to the end dot (solution card center)
  startY: 0, // % within the band (problem side)
  endY: 100, // % within the band (solution side)
};

/** SVG stepped connector for a "problem-left / solution-right" row. */
const Connector = ({ isRtl }) => (
  <Box
    aria-hidden
    sx={{
      display: { xs: "none", md: "block" },
      position: "absolute",
      insetInlineStart: PS_LAYOUT.card.width + CONNECTOR.gap,
      insetInlineEnd: PS_LAYOUT.card.width + CONNECTOR.gap,
      top: CONNECTOR.top,
      height: CONNECTOR.height,
      pointerEvents: "none",
    }}
  >
    <Box
      component="svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        // Internal SVG coords are always LTR; mirror the polyline so it lines up
        // with the logically-positioned end dots when the layout flips in RTL.
        transform: isRtl ? "scaleX(-1)" : "none",
      }}
    >
      <polyline
        points={`0,${CONNECTOR.startY} 32,${CONNECTOR.startY} 68,${CONNECTOR.endY} 100,${CONNECTOR.endY}`}
        fill="none"
        stroke={CONNECTOR.color}
        strokeWidth={CONNECTOR.width}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </Box>
    {/* End dots (kept circular via HTML, independent of the SVG stretch). */}
    <Box
      sx={{
        position: "absolute",
        insetInlineStart: 0,
        top: `${CONNECTOR.startY}%`,
        width: CONNECTOR.dot,
        height: CONNECTOR.dot,
        borderRadius: "50%",
        bgcolor: CONNECTOR.color,
        transform: "translate(-50%, -50%)",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        insetInlineEnd: 0,
        top: `${CONNECTOR.endY}%`,
        width: CONNECTOR.dot,
        height: CONNECTOR.dot,
        borderRadius: "50%",
        bgcolor: CONNECTOR.color,
        transform: "translate(50%, -50%)",
      }}
    />
  </Box>
);

/** Rounded label pill ("Problem" / "Solution"). */
const LabelPill = ({ label, borderColor }) => (
  <Box
    sx={{
      width: { xs: "100%", md: PS_LAYOUT.pill.width },
      maxWidth: "100%",
      height: PS_LAYOUT.pill.height,
      display: "flex",
      alignItems: "center",
      px: 3,
      bgcolor: PS_COLORS.cardBg,
      border: `${PS_LAYOUT.pill.borderWidth}px solid ${borderColor}`,
      borderRadius: `${PS_LAYOUT.pill.radius}px`,
    }}
  >
    <Typography sx={{ ...PS_TYPOGRAPHY.pillLabel, color: PS_COLORS.pillText }}>
      {label}
    </Typography>
  </Box>
);

/** Cream content card: bold title + description. */
const ContentCard = ({ title, desc }) => (
  <Box
    sx={{
      width: { xs: "100%", md: PS_LAYOUT.card.width },
      maxWidth: "100%",
      minHeight: { md: PS_LAYOUT.card.minHeight },
      p: 3,
      bgcolor: PS_COLORS.cardBg,
      borderRadius: `${PS_LAYOUT.card.radius}px`,
      boxShadow: PS_LAYOUT.card.shadow,
    }}
  >
    <Typography sx={{ ...PS_TYPOGRAPHY.cardTitle, color: PS_COLORS.cardTitle, mb: 1.5 }}>
      {title}
    </Typography>
    <Typography sx={{ ...PS_TYPOGRAPHY.cardDesc, color: PS_COLORS.cardDesc }}>
      {desc}
    </Typography>
  </Box>
);

/** Decorative contour graphic, anchored just left of the Problem card. */
const LeftDecor = ({ img, isRtl }) => (
  <Box
    component="img"
    src={img.src}
    alt={img.alt}
    aria-hidden
    sx={{
      position: "absolute",
      // Right edge stops `gap` px short of the column (= card) left edge; the
      // rest bleeds left and is clipped by the section's overflow:hidden.
      insetInlineStart: -(img.width + img.gap),
      top: img.top,
      width: img.width,
      height: "auto",
      display: { xs: "none", md: "block" },
      pointerEvents: "none",
      // Mirror the artwork so it curls toward the card on the flipped side.
      transform: isRtl ? "scaleX(-1)" : "none",
    }}
  />
);

/** Decorative contour graphic, anchored just right of the Solution card. */
const RightDecor = ({ img, isRtl }) => (
  <Box
    component="img"
    src={img.src}
    alt={img.alt}
    aria-hidden
    sx={{
      position: "absolute",
      // Left edge stops `gap` px right of the column (= card) right edge; the
      // rest bleeds right and is clipped by the section's overflow:hidden.
      insetInlineEnd: -(img.width + img.gap),
      top: img.top,
      width: img.width,
      height: "auto",
      display: { xs: "none", md: "block" },
      pointerEvents: "none",
      // Mirror the artwork so it curls toward the card on the flipped side.
      transform: isRtl ? "scaleX(-1)" : "none",
    }}
  />
);

/** One problem→solution row (staggered two columns on desktop). */
const PairRow = ({ item, t, isRtl, leftDecor, rightDecor }) => (
  <Box sx={{ position: "relative" }}>
    <Connector isRtl={isRtl} />
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        columnGap: { md: 6 },
        rowGap: 4,
        alignItems: "start",
      }}
    >
      {/* Problem column */}
      <Stack spacing={2.5} sx={{ position: "relative", alignItems: { xs: "stretch", md: "flex-start" } }}>
        {leftDecor && <LeftDecor img={leftDecor} isRtl={isRtl} />}
        <LabelPill label={t(PS_HEADER.problemLabelKey)} borderColor={PS_COLORS.problemBorder} />
        <ContentCard
          title={t(item.problem.titleKey)}
          desc={t(item.problem.descKey)}
        />
      </Stack>

      {/* Solution column — staggered down on desktop */}
      <Stack
        spacing={2.5}
        sx={{
          position: "relative",
          alignItems: { xs: "stretch", md: "flex-end" },
          mt: { md: 12 },
        }}
      >
        {rightDecor && <RightDecor img={rightDecor} isRtl={isRtl} />}
        {/* Big outline number — centered horizontally over the card. */}
        <Box sx={{ width: { xs: "100%", md: PS_LAYOUT.card.width }, textAlign: "center" }}>
          <Box component="span" sx={{ ...NUMBER_STYLE, display: "inline-block" }}>
            {item.number}
          </Box>
        </Box>
        <ContentCard
          title={t(item.solution.titleKey)}
          desc={t(item.solution.descKey)}
        />
        <LabelPill label={t(PS_HEADER.solutionLabelKey)} borderColor={PS_COLORS.solutionBorder} />
      </Stack>
    </Box>
  </Box>
);

/**
 * "The fix on the same desk" — problem→solution pairs. Header block on top,
 * decorative contour graphic on the left edge, then each numbered pair with a
 * Problem card (red pill) linked to a Solution card (green pill).
 *
 * NOTE: the connector line + exact number styling are first-pass values derived
 * from the design image (CONNECTOR / NUMBER_STYLE above) pending the client's
 * Figma spec. The header text, pills, and cards use the provided spec verbatim.
 */
const ProblemSolution = () => {
  const { t, isRtl } = useLanguage();

  return (
    <Box
      component="section"
      id="problem"
      sx={{ position: "relative", bgcolor: "#FFFFFF", overflow: "hidden", py: { xs: 8, md: 12 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2.5, md: 5, lg: 8 }, position: "relative" }}>
        {/* Header block */}
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography sx={{ ...PS_TYPOGRAPHY.eyebrow, color: PS_COLORS.eyebrow }}>
            {t(PS_HEADER.eyebrowKey)}
          </Typography>
          <Typography component="h2" sx={{ ...PS_TYPOGRAPHY.heading, color: PS_COLORS.heading }}>
            {t(PS_HEADER.headingLine1Key)}
            <br />
            {t(PS_HEADER.headingLine2Key)}
          </Typography>
          <Typography sx={{ ...PS_TYPOGRAPHY.subheading, color: PS_COLORS.subheading }}>
            {t(PS_HEADER.subheadingKey)}
          </Typography>
        </Stack>

        {/* Pairs */}
        <Stack id="solution" spacing={{ xs: 8, md: 12 }}>
          {PS_ITEMS.map((item, i) => (
            <PairRow
              key={item.number}
              item={item}
              t={t}
              isRtl={isRtl}
              leftDecor={i === 0 ? PS_LEFT_IMAGE : i === 2 ? PS_LEFT_IMAGE_2 : null}
              rightDecor={i === 1 ? PS_RIGHT_IMAGE : i === 3 ? PS_RIGHT_IMAGE_2 : null}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default ProblemSolution;
