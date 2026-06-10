"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { useAuth } from "@/lib/auth/AuthContext";
import { COLORS } from "@/lib/theme";
import ErrorAlert from "@/components/ErrorAlert";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HIGHLIGHTS = [
  {
    icon: <GroupsOutlinedIcon fontSize="small" />,
    title: "One pipeline for every role",
    body: "Track candidates from CV to offer in a single shared view.",
  },
  {
    icon: <BoltOutlinedIcon fontSize="small" />,
    title: "AI-assisted screening",
    body: "Score and shortlist applicants the moment they apply.",
  },
  {
    icon: <InsightsOutlinedIcon fontSize="small" />,
    title: "Hiring insights at a glance",
    body: "See where every job stands without chasing spreadsheets.",
  },
];

/** Forest-green brand panel shown alongside the form on larger screens. */
const BrandPanel = () => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      display: { xs: "none", md: "flex" },
      flexDirection: "column",
      justifyContent: "space-between",
      flex: 1,
      p: 6,
      color: "#eef2ef",
      background: `linear-gradient(165deg, ${COLORS.sidebarBg} 0%, #0d2b1f 100%)`,
    }}
  >
    {/* Decorative gold glow */}
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        top: -120,
        right: -120,
        width: 360,
        height: 360,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.gold}33 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />

    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: COLORS.gold,
          color: COLORS.sidebarBg,
        }}
      >
        <LockOutlinedIcon fontSize="small" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
        Kabil.ai
      </Typography>
    </Stack>

    <Box sx={{ maxWidth: 420 }}>
      <Typography
        variant="h4"
        sx={{ lineHeight: 1.25, mb: 1.5, fontWeight: 700 }}
      >
        Hire with clarity, from first CV to final offer.
      </Typography>
      <Typography variant="body1" sx={{ color: "#b9c7bf", mb: 4 }}>
        The HR console that keeps your whole team aligned on every candidate.
      </Typography>

      <Stack spacing={2.5}>
        {HIGHLIGHTS.map((item) => (
          <Stack key={item.title} direction="row" spacing={2}>
            <Box
              sx={{
                mt: 0.25,
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "#ffffff14",
                color: COLORS.goldSoft,
              }}
            >
              {item.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{item.title}</Typography>
              <Typography variant="body2" sx={{ color: "#9fb1a7" }}>
                {item.body}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>

    <Typography variant="caption" sx={{ color: "#7d9088" }}>
      © {new Date().getFullYear()} Kabil.ai — All rights reserved.
    </Typography>
  </Box>
);

const LoginForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    // Validate only after the first submit attempt, then live-revalidate on
    // change. Avoids showing errors before the user has interacted.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }) => {
    setServerError(null);
    try {
      await login(email.trim(), password);
      router.replace(params.get("next") || "/jobs");
    } catch (err) {
      setServerError(err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 3, sm: 6 },
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 380 }}>
        {/* Compact brand mark — only visible when the side panel is hidden */}
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ display: { md: "none" }, mb: 4, alignItems: "center" }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <LockOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Kabil.ai
          </Typography>
        </Stack>

        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to the HR console to continue.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <ErrorAlert error={serverError} />

            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              fullWidth
              disabled={isSubmitting}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: EMAIL_PATTERN,
                  message: "Enter a valid email address",
                },
              })}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              fullWidth
              disabled={isSubmitting}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              fullWidth
              sx={{ py: 1.25 }}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : null
              }
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

const LoginPage = () => (
  <Box sx={{ display: "flex", minHeight: "100dvh" }}>
    <BrandPanel />
    <Suspense>
      <LoginForm />
    </Suspense>
  </Box>
);

export default LoginPage;
