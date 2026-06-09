"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/auth/AuthContext";
import Sidebar from "./_components/Sidebar";
import TopBar from "./_components/TopBar";

/**
 * Client-side route guard + app shell for the HR console. Since the token
 * lives in localStorage, protection can't run on the server — we gate here
 * and bounce guests to /login (preserving where they were headed via ?next=).
 */
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <Sidebar />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <Box component="main" sx={{ flex: 1, p: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ProtectedLayout;
