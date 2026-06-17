"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { SIDEBAR_WIDTH, COLORS } from "@/lib/theme";
import { useAuth } from "@/lib/auth/AuthContext";
import { NAV_ITEMS, COMING_SOON_ITEMS } from "./navItems";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: "100dvh",
        position: "sticky",
        top: 0,
        bgcolor: COLORS.sidebarLight,
        borderRight: `1px solid ${COLORS.sidebarBorder}`,
        color: COLORS.sidebarText,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Box
          component="img"
          src="/Qabil_logo.svg"
          alt="Qabil"
          sx={{ height: 40, width: "auto", display: "block" }}
        />
      </Box>

      {/* Primary nav */}
      <List sx={{ px: 1.5, py: 1, flex: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: COLORS.sidebarText,
                "& .MuiListItemIcon-root": {
                  color: COLORS.sidebarIcon,
                  minWidth: 38,
                },
                "&.Mui-selected, &.Mui-selected:hover": {
                  bgcolor: COLORS.sidebarActive,
                  color: "#fff",
                  "& .MuiListItemIcon-root": { color: "#fff" },
                },
                "&:hover": { bgcolor: "rgba(47,125,91,0.08)" },
              }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active ? 700 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Coming soon */}
      <Box
        sx={{
          mx: 1.5,
          mb: 1.5,
          px: 1.75,
          py: 1.5,
          borderRadius: 2,
          border: `1px dashed ${COLORS.sidebarBorder}`,
          bgcolor: "rgba(0,0,0,0.015)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.75,
            letterSpacing: 1,
            color: COLORS.sidebarMuted,
            fontWeight: 700,
          }}
        >
          COMING SOON
        </Typography>
        {COMING_SOON_ITEMS.map(({ label }) => (
          <Stack
            key={label}
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", py: 0.6 }}
          >
            <Typography sx={{ fontSize: 14, color: COLORS.sidebarText }}>
              {label}
            </Typography>
            <Chip
              label="SOON"
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: COLORS.gold,
                bgcolor: "rgba(201,162,63,0.12)",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Stack>
        ))}
      </Box>

      {/* Footer: settings + user */}
      <Box sx={{ borderTop: `1px solid ${COLORS.sidebarBorder}`, px: 1.5, py: 1.5 }}>
        <ListItemButton
          disabled
          sx={{
            borderRadius: 2,
            mb: 0.5,
            "& .MuiListItemIcon-root": { color: COLORS.sidebarMuted, minWidth: 38 },
          }}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            slotProps={{ primary: { sx: { fontSize: 14, color: COLORS.sidebarText } } }}
          />
        </ListItemButton>

        <Stack direction="row" spacing={1.5} sx={{ px: 1, py: 0.5, alignItems: "center" }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.sidebarActive, color: "#fff", fontSize: 13, fontWeight: 700 }}>
            {initials(user?.full_name) || "?"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: COLORS.sidebarText }}>
              {user?.full_name || "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.sidebarMuted }} noWrap>
              {user?.role || ""}
            </Typography>
          </Box>
          <Tooltip title="Log out">
            <IconButton size="small" onClick={onLogout} sx={{ color: COLORS.sidebarMuted }}>
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default Sidebar;
