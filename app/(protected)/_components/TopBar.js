"use client";

import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { COLORS } from "@/lib/theme";
import { useAuth } from "@/lib/auth/AuthContext";

const initials = (name = "") =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

/** Long-form date shown under the page title, e.g. "Thursday, 25 May 2026". */
const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const humanize = (seg = "") =>
  seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Friendly labels for known route segments. */
const SEGMENT_LABELS = {
  dashboard: "Dashboard",
  jobs: "Jobs",
  new: "New Job",
  pipeline: "Pipeline",
  "cv-inbox": "CV Inbox",
  "talent-pool": "Talent Pool",
};

/** Derive the page title from the last segment of the current route. */
const pageTitle = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return "";
  const last = segments[segments.length - 1];
  return SEGMENT_LABELS[last] || (segments[segments.length - 2] === "jobs" ? "Job" : humanize(last));
};

const TopBar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const title = pageTitle(pathname);

  return (
    <Box
      component="header"
      sx={{
        bgcolor: "background.default",
        borderBottom: `1px solid ${COLORS.sidebarBorder}`,
        px: 4,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Title + date */}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography variant="caption" noWrap sx={{ color: "text.secondary" }}>
          {todayLabel()}
        </Typography>
      </Box>

      {/* Center search — visual shell; global search isn't wired yet. */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 520,
          mx: "auto",
          display: { xs: "none", md: "block" },
        }}
      >
        <InputBase
          fullWidth
          placeholder="Search…"
          startAdornment={
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          }
          sx={{
            px: 1.75,
            py: 0.75,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.035)",
            fontSize: 14,
            "& .MuiInputBase-input": { p: 0 },
          }}
        />
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", ml: "auto" }}>
        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {user?.full_name || "—"}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.gold, fontWeight: 600, textTransform: "capitalize" }}>
            {user?.role || ""}
          </Typography>
        </Box>
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}>
          {initials(user?.full_name) || "?"}
        </Avatar>
      </Stack>
    </Box>
  );
};

export default TopBar;
