"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  FOOTER_COLORS,
  FOOTER_CONTENT,
  FOOTER_LAYOUT,
  FOOTER_LINK_COLUMNS,
  FOOTER_TYPOGRAPHY,
  LANDING_LOGO,
} from "@/lib/kabil/landing";
import { handleAnchorClick } from "@/lib/kabil/smoothScroll";

/**
 * Site footer — green band. Left: white logo, a short heading, and a
 * gold-outlined "Chat With Us" button. Right: grouped nav links, a divider,
 * and the copyright line. All colors, type, copy come from constants; mirrors
 * in RTL via logical layout.
 */
const Footer = () => {
  const { t, isRtl } = useLanguage();

  return (
    <Box
      component="footer"
      sx={{ bgcolor: FOOTER_COLORS.bg, minHeight: { md: FOOTER_LAYOUT.height } }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2.5, md: 5, lg: 8 },
          py: { xs: 6, md: 7 },
          height: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: { xs: 5, md: 4 },
        }}
      >
        {/* Left block */}
        <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
          <Box
            component="img"
            src={LANDING_LOGO.src}
            alt={LANDING_LOGO.alt}
            sx={{
              width: FOOTER_LAYOUT.logoWidth,
              height: "auto",
              // Force the coloured mark to solid white.
              filter: "brightness(0) invert(1)",
            }}
          />
          <Typography sx={{ ...FOOTER_TYPOGRAPHY.heading, color: FOOTER_COLORS.heading, maxWidth: 340 }}>
            {t(FOOTER_CONTENT.headingKey)}
          </Typography>
          <Box
            component="a"
            href={FOOTER_CONTENT.buttonHref}
            onClick={handleAnchorClick}
            sx={{
              ...FOOTER_TYPOGRAPHY.button,
              color: FOOTER_COLORS.buttonText,
              width: FOOTER_LAYOUT.button.width,
              height: FOOTER_LAYOUT.button.height,
              border: `${FOOTER_LAYOUT.button.borderWidth}px solid ${FOOTER_COLORS.buttonBorder}`,
              borderRadius: `${FOOTER_LAYOUT.button.radius}px`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            {t(FOOTER_CONTENT.buttonLabelKey)}
            <Box component="span" sx={{ display: "inline-flex", transform: isRtl ? "scaleX(-1)" : "none" }}>
              →
            </Box>
          </Box>
        </Stack>

        {/* Right block */}
        <Stack spacing={3} sx={{ alignItems: { xs: "flex-start", md: "flex-end" }, minWidth: { md: 420 } }}>
          {/* Link columns */}
          <Box sx={{ display: "flex", gap: { xs: 5, md: 6 } }}>
            {FOOTER_LINK_COLUMNS.map((column, i) => (
              <Stack key={i} spacing={1.5}>
                {column.map((linkItem) => (
                  <Box
                    key={linkItem.labelKey}
                    component="a"
                    href={linkItem.href}
                    onClick={handleAnchorClick}
                    sx={{
                      ...FOOTER_TYPOGRAPHY.link,
                      color: FOOTER_COLORS.link,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      "&:hover": { color: FOOTER_COLORS.heading },
                    }}
                  >
                    {t(linkItem.labelKey)}
                  </Box>
                ))}
              </Stack>
            ))}
          </Box>

          {/* Divider */}
          <Box sx={{ width: "100%", height: "1px", bgcolor: FOOTER_COLORS.divider }} />

          {/* Copyright */}
          <Typography
            sx={{
              ...FOOTER_TYPOGRAPHY.copyright,
              color: FOOTER_COLORS.copyright,
              textAlign: { xs: "start", md: "end" },
            }}
          >
            {t(FOOTER_CONTENT.copyrightKey)}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
