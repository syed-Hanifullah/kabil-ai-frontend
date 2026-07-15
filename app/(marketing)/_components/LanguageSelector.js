"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LanguageIcon from "@mui/icons-material/Language";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/lib/i18n/translations";
import { HEADER_TYPOGRAPHY } from "@/lib/kabil/landing";

/**
 * Globe + current-language code + chevron, opening a small menu to pick
 * English or العربية. Switching updates the whole app (copy + RTL) via the
 * language context. Type spec comes from HEADER_TYPOGRAPHY.langSelector.
 */
const LanguageSelector = () => {
  const { locale, setLocale } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const current = LANGUAGE_OPTIONS.find((o) => o.code === locale) ?? LANGUAGE_OPTIONS[0];

  const handleSelect = (code) => {
    setLocale(code);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disableRipple
        sx={{
          minWidth: 0,
          px: 1,
          gap: 0.75,
          color: HEADER_TYPOGRAPHY.langSelector.color,
          "&:hover": { bgcolor: "transparent" },
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <LanguageIcon sx={{ fontSize: 18 }} />
        <Box component="span" sx={{ ...HEADER_TYPOGRAPHY.langSelector }}>
          {current.short}
        </Box>
        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.code}
            selected={opt.code === locale}
            onClick={() => handleSelect(opt.code)}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
