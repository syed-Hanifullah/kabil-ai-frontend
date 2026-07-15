"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  FEATURES_COLORS,
  FEATURES_HEADER,
  FEATURES_ITEMS,
  FEATURES_LAYOUT,
  FEATURES_TYPOGRAPHY,
} from "@/lib/kabil/landing";

// Map the constant's icon key → MUI icon component.
const ICONS = {
  shield: ShieldOutlined,
  language: LanguageOutlined,
  assignment: AssignmentOutlined,
  description: DescriptionOutlined,
};

/** Rounded chip holding a feature card's icon. */
const IconChip = ({ name }) => {
  const Icon = ICONS[name];
  const { iconChip } = FEATURES_LAYOUT;
  return (
    <Box
      sx={{
        flexShrink: 0,
        width: iconChip.size,
        height: iconChip.size,
        borderRadius: `${iconChip.radius}px`,
        bgcolor: FEATURES_COLORS.iconChipBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon sx={{ fontSize: iconChip.iconSize, color: FEATURES_COLORS.icon }} />
    </Box>
  );
};

/** One feature card: icon chip + title on a row, value beneath. */
const FeatureCard = ({ item, t }) => (
  <Box
    sx={{
      width: { xs: "100%", md: FEATURES_LAYOUT.card.width },
      maxWidth: "100%",
      minHeight: { md: FEATURES_LAYOUT.card.height },
      p: 3,
      bgcolor: FEATURES_COLORS.cardBg,
      border: `${FEATURES_LAYOUT.card.borderWidth}px solid ${FEATURES_COLORS.cardBorder}`,
      borderRadius: `${FEATURES_LAYOUT.card.radius}px`,
    }}
  >
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
      <IconChip name={item.icon} />
      <Typography sx={{ ...FEATURES_TYPOGRAPHY.cardTitle, color: FEATURES_COLORS.cardTitle }}>
        {t(item.titleKey)}
      </Typography>
    </Stack>
    <Typography sx={{ ...FEATURES_TYPOGRAPHY.cardValue, color: FEATURES_COLORS.cardValue }}>
      {t(item.valueKey)}
    </Typography>
  </Box>
);

/**
 * "Built for the Gulf" — centered eyebrow + heading, then a 2×2 grid of
 * feature cards (icon chip, green title, grey value). All colors, type, copy,
 * and card sizing come from constants.
 */
const Features = () => {
  const { t } = useLanguage();

  return (
    <Box component="section" id="features" sx={{ bgcolor: "#FFFFFF", py: { xs: 8, md: 12 } }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2.5, md: 5, lg: 8 } }}>
        {/* Header block */}
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography sx={{ ...FEATURES_TYPOGRAPHY.eyebrow, color: FEATURES_COLORS.eyebrow }}>
            {t(FEATURES_HEADER.eyebrowKey)}
          </Typography>
          <Typography component="h2" sx={{ ...FEATURES_TYPOGRAPHY.heading, color: FEATURES_COLORS.heading }}>
            {t(FEATURES_HEADER.headingLine1Key)}
            <br />
            {t(FEATURES_HEADER.headingLine2Key)}
          </Typography>
        </Stack>

        {/* 2×2 card grid — centered as a block */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, auto)" },
            justifyContent: "center",
            columnGap: FEATURES_LAYOUT.columnGap,
            rowGap: FEATURES_LAYOUT.rowGap,
          }}
        >
          {FEATURES_ITEMS.map((item) => (
            <FeatureCard key={item.titleKey} item={item} t={t} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Features;
