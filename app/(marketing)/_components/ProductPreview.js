"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  PREVIEW_COLORS,
  PREVIEW_CONTENT,
  PREVIEW_IMAGE,
  PREVIEW_LAYOUT,
  PREVIEW_TYPOGRAPHY,
} from "@/lib/kabil/landing";

/**
 * "Product Preview" — a dark diagonal-gradient band with a centered eyebrow /
 * heading / sub-heading, followed by a laptop dashboard mockup. All colors,
 * type, and copy come from constants (lib/kabil/landing.js + translations).
 */
const ProductPreview = () => {
  const { t } = useLanguage();

  return (
    <Box
      component="section"
      id="preview"
      sx={{
        background: PREVIEW_COLORS.bg,
        overflow: "hidden",
        // Fixed height on desktop (design spec); auto on small screens so the
        // header + mockup never get clipped when stacked.
        height: { md: PREVIEW_LAYOUT.height },
        display: "flex",
        alignItems: "center",
        py: { xs: 8, md: 0 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", px: { xs: 2.5, md: 5, lg: 8 } }}>
        {/* Header block */}
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography sx={{ ...PREVIEW_TYPOGRAPHY.eyebrow, color: PREVIEW_COLORS.eyebrow }}>
            {t(PREVIEW_CONTENT.eyebrowKey)}
          </Typography>
          <Typography component="h2" sx={{ ...PREVIEW_TYPOGRAPHY.heading, color: PREVIEW_COLORS.heading }}>
            {t(PREVIEW_CONTENT.headingKey)}
          </Typography>
          <Typography sx={{ ...PREVIEW_TYPOGRAPHY.subheading, color: PREVIEW_COLORS.subheading }}>
            {t(PREVIEW_CONTENT.subheadingKey)}
          </Typography>
        </Stack>

        {/* Laptop dashboard mockup (rendered once the asset is provided) */}
        {PREVIEW_IMAGE.src && (
          <Box
            component="img"
            src={PREVIEW_IMAGE.src}
            alt={t(PREVIEW_IMAGE.altKey)}
            sx={{
              display: "block",
              width: "100%",
              maxWidth: PREVIEW_IMAGE.maxWidth,
              height: "auto",
              mx: "auto",
              mt: { xs: 5, md: 8 },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ProductPreview;
