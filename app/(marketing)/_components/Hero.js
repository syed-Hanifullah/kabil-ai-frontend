"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  HERO_COLORS,
  HERO_CONTENT,
  HERO_IMAGE,
  HERO_LAYOUT,
  HERO_TYPOGRAPHY,
} from "@/lib/kabil/landing";

/**
 * Button label + trailing arrow. Uses an inline-flex row with `gap` (not MUI's
 * endIcon) so the spacing between text and arrow is identical in LTR and RTL —
 * the row simply reverses in RTL and the arrow mirrors to keep pointing forward.
 */
const CtaContent = ({ label, isRtl }) => (
  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
    {label}
    <ArrowForwardIcon
      sx={{ fontSize: 18, transform: isRtl ? "scaleX(-1)" : "none" }}
    />
  </Box>
);

/**
 * Landing hero: green full-width band with the value proposition, headline
 * (white + gold accent), sub-copy, and two CTAs (Book a demo / Watch Overview).
 * All colors, type, and copy come from constants; RTL is handled globally, so
 * the column simply aligns to the inline start.
 */
const Hero = () => {
  const { t, isRtl } = useLanguage();

  // Two stacked gold glows → concentrate the halo on the right + bottom legs.
  const glow = `drop-shadow(8px 0 ${HERO_IMAGE.glowBlur}px ${HERO_IMAGE.glowColor}) drop-shadow(0 8px ${HERO_IMAGE.glowBlur}px ${HERO_IMAGE.glowColor})`;

  return (
    <Box
      component="section"
      sx={{
        bgcolor: HERO_COLORS.bg,
        minHeight: { xs: "auto", md: HERO_LAYOUT.height },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2.5, md: 5, lg: 8 },
          py: { xs: 6, md: 0 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          // Bottom-align the text column and the image so the image's bottom
          // edge lines up with the CTA buttons (last item in the column).
          alignItems: { xs: "stretch", md: "flex-end" },
          gap: { md: 4 },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            maxWidth: HERO_LAYOUT.contentMaxWidth,
            alignItems: "flex-start",
            textAlign: "start",
          }}
        >
          {/* Eyebrow */}
          <Typography sx={{ ...HERO_TYPOGRAPHY.eyebrow, color: HERO_COLORS.eyebrow }}>
            {t(HERO_CONTENT.eyebrowKey)}
          </Typography>

          {/* Headline: line 1 (light) + line 2 (light lead + gold accent) */}
          <Typography
            component="h1"
            sx={{
              ...HERO_TYPOGRAPHY.heading,
              color: HERO_COLORS.headingLight,
              fontSize: { xs: 30, md: HERO_TYPOGRAPHY.heading.fontSize },
              lineHeight: { xs: "42px", md: HERO_TYPOGRAPHY.heading.lineHeight },
            }}
          >
            {t(HERO_CONTENT.headingLine1Key)}
            <br />
            {t(HERO_CONTENT.headingLine2LeadKey)}
            <Box component="span" sx={{ color: HERO_COLORS.headingAccent }}>
              {t(HERO_CONTENT.headingLine2AccentKey)}
            </Box>
          </Typography>

          {/* Sub-copy */}
          <Typography
            sx={{
              ...HERO_TYPOGRAPHY.subtext,
              color: HERO_COLORS.subtext,
              fontSize: { xs: 16, md: HERO_TYPOGRAPHY.subtext.fontSize },
              lineHeight: { xs: "26px", md: HERO_TYPOGRAPHY.subtext.lineHeight },
            }}
          >
            {t(HERO_CONTENT.subtextKey)}
          </Typography>

          {/* CTAs */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              pt: 1,
              width: { xs: "100%", sm: "auto" },
              gap: `${HERO_LAYOUT.ctaGap}px`,
            }}
          >
            <Button
              component={Link}
              href={HERO_CONTENT.bookDemo.href}
              disableRipple
              sx={{
                ...HERO_TYPOGRAPHY.bookDemo,
                color: HERO_COLORS.bookDemoText,
                bgcolor: HERO_COLORS.bookDemoBg,
                borderRadius: `${HERO_LAYOUT.bookDemoRadius}px`,
                boxShadow: HERO_LAYOUT.bookDemoShadow,
                px: 3,
                py: 1.5,
                textTransform: "none",
                "&:hover": { bgcolor: HERO_COLORS.bookDemoBg, opacity: 0.92 },
              }}
            >
              <CtaContent label={t(HERO_CONTENT.bookDemo.labelKey)} isRtl={isRtl} />
            </Button>

            <Button
              component="a"
              href={HERO_CONTENT.watch.href}
              disableRipple
              sx={{
                ...HERO_TYPOGRAPHY.watch,
                color: HERO_COLORS.watchText,
                border: `${HERO_LAYOUT.watchBorderWidth}px solid ${HERO_COLORS.watchBorder}`,
                borderRadius: `${HERO_LAYOUT.watchRadius}px`,
                px: 3,
                py: 1.5,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(239, 159, 39, 0.08)",
                  borderColor: HERO_COLORS.watchBorder,
                },
              }}
            >
              <CtaContent label={t(HERO_CONTENT.watch.labelKey)} isRtl={isRtl} />
            </Button>
          </Stack>
        </Stack>

        {/* Right-triangle skyline image with gold glow (desktop only). */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            flexShrink: 0,
            width: HERO_IMAGE.width,
            height: HERO_IMAGE.height,
            // Push a bit further toward the edge (mirrors in RTL).
            marginInlineEnd: `${HERO_IMAGE.offsetEnd}px`,
            // Mirror onto the inline-start side in RTL.
            transform: isRtl ? "scaleX(-1)" : "none",
            // Glow lives on the wrapper (not the clipped img) so clip-path can't
            // cut the drop-shadow away — clip-path is applied after filter.
            filter: glow,
          }}
        >
          <Box
            component="img"
            src={HERO_IMAGE.src}
            alt={t(HERO_IMAGE.altKey)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              clipPath: HERO_IMAGE.clipPath,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Hero;
