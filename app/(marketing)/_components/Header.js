"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  HEADER_LAYOUT,
  HEADER_TYPOGRAPHY,
  LANDING_LOGO,
  LANDING_NAV_LINKS,
  LANDING_ROUTES,
} from "@/lib/kabil/landing";
import { handleAnchorClick } from "@/lib/kabil/smoothScroll";
import LanguageSelector from "./LanguageSelector";

/** Brand logo, links home. Intrinsic ratio preserved, height fixed. */
const Logo = () => (
  <Box
    component={Link}
    href={LANDING_LOGO.href}
    sx={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
    aria-label={LANDING_LOGO.alt}
  >
    <Box
      component="img"
      src={LANDING_LOGO.src}
      alt={LANDING_LOGO.alt}
      sx={{
        width: LANDING_LOGO.width,
        height: LANDING_LOGO.height,
        // Scale down proportionally on the shorter mobile bar.
        transform: { xs: "scale(0.7)", md: "none" },
        transformOrigin: "inline-start center",
        display: "block",
      }}
    />
  </Box>
);

/** A single nav link (used in both the desktop bar and the mobile drawer). */
const NavLink = ({ link, onClick }) => {
  const { t } = useLanguage();
  return (
    <Box
      component="a"
      href={link.href}
      onClick={(e) => handleAnchorClick(e, { onNavigate: onClick })}
      sx={{
        ...HEADER_TYPOGRAPHY.navLink,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s ease",
        "&:hover": { opacity: 0.6 },
      }}
    >
      {t(link.labelKey)}
    </Box>
  );
};

/** Outlined "Book a Demo →" pill. Arrow mirrors for RTL. */
const BookDemoButton = ({ onClick }) => {
  const { t, isRtl } = useLanguage();
  return (
    <Button
      component={Link}
      href={LANDING_ROUTES.bookDemo}
      onClick={onClick}
      disableRipple
      sx={{
        ...HEADER_TYPOGRAPHY.bookDemo,
        px: 2.5,
        py: 1.25,
        borderRadius: `${HEADER_LAYOUT.bookDemoRadius}px`,
        border: `1.5px solid ${HEADER_LAYOUT.bookDemoBorder}`,
        whiteSpace: "nowrap",
        "&:hover": {
          bgcolor: "rgba(15, 110, 86, 0.06)",
          borderColor: HEADER_LAYOUT.bookDemoBorder,
        },
      }}
    >
      {/* Inline label + arrow with `gap` (not endIcon) so text↔arrow spacing is
          identical in LTR and RTL — the row reverses and the arrow mirrors. */}
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        {t("nav.bookDemo")}
        <ArrowForwardIcon
          sx={{ fontSize: 18, transform: isRtl ? "scaleX(-1)" : "none" }}
        />
      </Box>
    </Button>
  );
};

/**
 * Public landing header: logo, centered nav, language selector, and the
 * "Book a Demo" CTA. Below the `md` breakpoint the nav collapses into a
 * hamburger that opens a full drawer. RTL is handled globally via the language
 * context (the document `dir` flips the whole bar).
 */
const Header = () => {
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: HEADER_LAYOUT.bg,
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          height: { xs: HEADER_LAYOUT.heightMobile, md: HEADER_LAYOUT.heightDesktop },
          px: { xs: 2.5, md: 5, lg: 8 },
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Logo />

        {/* Desktop nav — centered */}
        <Stack
          direction="row"
          component="nav"
          spacing={HEADER_LAYOUT.navGap}
          sx={{
            display: { xs: "none", md: "flex" },
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {LANDING_NAV_LINKS.map((link) => (
            <NavLink key={link.id} link={link} />
          ))}
        </Stack>

        {/* Desktop actions — pushed to the end */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ display: { xs: "none", md: "flex" }, flexShrink: 0, alignItems: "center" }}
        >
          <LanguageSelector />
          <BookDemoButton />
        </Stack>

        {/* Mobile: spacer + hamburger */}
        <Box sx={{ flex: 1, display: { xs: "block", md: "none" } }} />
        <IconButton
          onClick={() => setDrawerOpen(true)}
          aria-label={t("nav.openMenu")}
          sx={{ display: { xs: "inline-flex", md: "none" }, color: "rgba(0,0,0,0.8)" }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="top"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{ display: { md: "none" } }}
        PaperProps={{ sx: { px: 3, py: 2 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Logo />
          <IconButton onClick={closeDrawer} aria-label={t("nav.closeMenu")}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack component="nav" spacing={2.5} sx={{ py: 2 }}>
          {LANDING_NAV_LINKS.map((link) => (
            <NavLink key={link.id} link={link} onClick={closeDrawer} />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ pt: 1, pb: 2, alignItems: "center" }}>
          <LanguageSelector />
          <BookDemoButton onClick={closeDrawer} />
        </Stack>
      </Drawer>
    </Box>
  );
};

export default Header;
