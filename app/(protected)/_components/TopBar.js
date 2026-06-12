"use client";

import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { COLORS } from "@/lib/theme";
import { useAuth } from "@/lib/auth/AuthContext";

const initials = (name = "") =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

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
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: 4,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
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
      </Stack>
    </Box>
  );
};

export default TopBar;
