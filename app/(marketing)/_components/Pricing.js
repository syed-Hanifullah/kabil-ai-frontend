"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  PRICING_COLORS,
  PRICING_CONTENT,
  PRICING_LAYOUT,
  PRICING_TYPOGRAPHY,
} from "@/lib/kabil/landing";

/**
 * "Founding Partner Programme" — centered eyebrow + heading, then a single
 * cream pricing card: serif price, SAR conversion, description (with the
 * duration emphasised), and the founding-seats line. All colors, type, copy,
 * and card sizing come from constants.
 */
const Pricing = () => {
  const { t } = useLanguage();

  return (
    <Box component="section" id="pricing" sx={{ bgcolor: "#FFFFFF", py: { xs: 8, md: 12 } }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2.5, md: 5, lg: 8 } }}>
        {/* Header block */}
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography sx={{ ...PRICING_TYPOGRAPHY.eyebrow, color: PRICING_COLORS.eyebrow }}>
            {t(PRICING_CONTENT.eyebrowKey)}
          </Typography>
          <Typography component="h2" sx={{ ...PRICING_TYPOGRAPHY.heading, color: PRICING_COLORS.heading }}>
            {t(PRICING_CONTENT.headingLine1Key)}
            <br />
            {t(PRICING_CONTENT.headingLine2Key)}
          </Typography>
        </Stack>

        {/* Pricing card */}
        <Box
          sx={{
            width: { xs: "100%", md: PRICING_LAYOUT.card.width },
            maxWidth: "100%",
            minHeight: { md: PRICING_LAYOUT.card.height },
            mx: "auto",
            px: { xs: 3, md: 8 },
            py: { xs: 5, md: 6 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: PRICING_COLORS.cardBg,
            border: `${PRICING_LAYOUT.card.borderWidth}px solid ${PRICING_COLORS.cardBorder}`,
            borderRadius: `${PRICING_LAYOUT.card.radius}px`,
            boxShadow: PRICING_LAYOUT.card.shadow,
          }}
        >
          {/* Price: "AED 2,000" + "/month" on the same baseline */}
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
            <Box component="span" sx={{ ...PRICING_TYPOGRAPHY.price, color: PRICING_COLORS.price }}>
              {t(PRICING_CONTENT.priceKey)}
            </Box>
            <Box component="span" sx={{ ...PRICING_TYPOGRAPHY.priceUnit, color: PRICING_COLORS.price }}>
              {t(PRICING_CONTENT.priceUnitKey)}
            </Box>
          </Box>

          {/* SAR conversion */}
          <Typography sx={{ ...PRICING_TYPOGRAPHY.sar, color: PRICING_COLORS.meta, mt: 2 }}>
            {t(PRICING_CONTENT.sarKey)}
          </Typography>

          {/* Description with emphasised duration */}
          <Typography sx={{ ...PRICING_TYPOGRAPHY.description, color: PRICING_COLORS.meta, mt: 2, maxWidth: 560 }}>
            {t(PRICING_CONTENT.descLeadKey)}
            <Box component="span" sx={{ fontWeight: 700, color: PRICING_COLORS.price }}>
              {t(PRICING_CONTENT.descEmphasisKey)}
            </Box>
            {t(PRICING_CONTENT.descTailKey)}
          </Typography>

          {/* Founding-seats line */}
          <Typography sx={{ ...PRICING_TYPOGRAPHY.seats, color: PRICING_COLORS.seats, mt: 3 }}>
            {t(PRICING_CONTENT.seatsKey)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Pricing;
