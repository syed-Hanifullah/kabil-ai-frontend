"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { useAuth } from "@/lib/auth/AuthContext";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

/**
 * Marketing shell for the public landing area (route group "(marketing)",
 * which maps to "/"). Guests see the page immediately; once a stored token
 * resolves as valid, logged-in users are forwarded straight to the dashboard.
 *
 * The header/footer chrome is added in the design step — for now this just
 * hosts the redirect logic and renders the page.
 */
const MarketingLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#FFFFFF" }}>
      <Header />
      {children}
      <Footer />
    </Box>
  );
};

export default MarketingLayout;
