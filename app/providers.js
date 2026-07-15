"use client";

import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { createAppTheme } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { LanguageProvider, useLanguage } from "@/lib/i18n/LanguageContext";

// Emotion cache config per direction. Arabic (rtl) runs the stylis RTL plugin
// so MUI component styles (padding, margins, icon positions) mirror correctly;
// English (ltr) uses the default prefixer only. Each direction gets its own
// cache `key` so their generated class names never collide.
const CACHE_OPTIONS = {
  ltr: { key: "mui", stylisPlugins: [prefixer] },
  rtl: { key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] },
};

/**
 * Applies the MUI theme + emotion cache for the currently-selected language
 * direction. Sits inside <LanguageProvider> so it re-renders when the user
 * toggles English/Arabic.
 */
const DirectionalMui = ({ children }) => {
  const { direction } = useLanguage();
  const theme = useMemo(() => createAppTheme(direction), [direction]);

  return (
    <AppRouterCacheProvider options={CACHE_OPTIONS[direction]}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

const Providers = ({ children }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 10_000 },
        },
      }),
  );

  return (
    <LanguageProvider>
      <DirectionalMui>
        <QueryClientProvider client={client}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </DirectionalMui>
    </LanguageProvider>
  );
};

export default Providers;
