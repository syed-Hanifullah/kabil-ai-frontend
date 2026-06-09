/** Shared MUI theme + layout constants. Brand: deep forest green + gold accent. */
"use client";

import { createTheme } from "@mui/material/styles";

/** Layout / brand constants reused across the protected shell. */
export const SIDEBAR_WIDTH = 256;
export const COLORS = {
  sidebarBg: "#11352a",
  sidebarBgHover: "#1a4636",
  gold: "#c9a23f",
  goldSoft: "#d8b85a",
};

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#13402d", dark: "#0d2b1f", contrastText: "#ffffff" },
    secondary: { main: COLORS.gold, contrastText: "#11352a" },
    background: { default: "#f5f6f7", paper: "#ffffff" },
    text: { primary: "#1c2522", secondary: "#647067" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-sans), system-ui, Arial, sans-serif",
    // Slightly smaller, denser baseline (MUI default is 14).
    fontSize: 13,
    h4: { fontWeight: 700, fontSize: "1.6rem" },
    h5: { fontWeight: 700, fontSize: "1.3rem" },
    h6: { fontWeight: 600, fontSize: "1.05rem" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid #e7eae8", boxShadow: "none" },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          },
        }),
      },
    },
  },
});
