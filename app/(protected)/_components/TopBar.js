"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { COLORS } from "@/lib/theme";
import { useAuth } from "@/lib/auth/AuthContext";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const today = () =>
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const firstName = (name = "") => name.split(" ")[0];
const initials = (name = "") =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const TopBar = () => {
  const { user } = useAuth();

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
        <Typography variant="h6" fontWeight={700} noWrap>
          {greeting()}, {firstName(user?.full_name) || "there"} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {today()}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton size="small">
          <Badge badgeContent={3} color="secondary">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.full_name || "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.gold, fontWeight: 600 }}>
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
