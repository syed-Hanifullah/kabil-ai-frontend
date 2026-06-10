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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
        bgcolor: COLORS.sidebarBg,
        color: "rgba(255,255,255,0.85)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Brand */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ px: 2.5, py: 2.5, alignItems: "center" }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: COLORS.gold,
            color: COLORS.sidebarBg,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          K
        </Box>
        <Box>
          <Typography variant="subtitle1" color="#fff" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Kabil.ai
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>
            HR Console
          </Typography>
        </Box>
      </Stack>

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
                color: active ? COLORS.sidebarBg : "rgba(255,255,255,0.82)",
                "& .MuiListItemIcon-root": {
                  color: active ? COLORS.sidebarBg : "rgba(255,255,255,0.7)",
                  minWidth: 38,
                },
                "&.Mui-selected, &.Mui-selected:hover": {
                  bgcolor: COLORS.gold,
                  color: COLORS.sidebarBg,
                  "& .MuiListItemIcon-root": { color: COLORS.sidebarBg },
                },
                "&:hover": { bgcolor: COLORS.sidebarBgHover },
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

        <Typography
          variant="caption"
          sx={{
            display: "block",
            px: 1.5,
            mt: 2,
            mb: 0.5,
            letterSpacing: 1,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 700,
          }}
        >
          COMING SOON
        </Typography>
        {COMING_SOON_ITEMS.map(({ label, icon: Icon }) => (
          <ListItemButton
            key={label}
            disabled
            sx={{
              borderRadius: 2,
              mb: 0.5,
              opacity: 0.45,
              "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.6)", minWidth: 38 },
              "&.Mui-disabled": { opacity: 0.45 },
            }}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={label}
              slotProps={{ primary: { sx: { fontSize: 14, color: "rgba(255,255,255,0.7)" } } }}
            />
            <LockOutlinedIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }} />
          </ListItemButton>
        ))}
      </List>

      {/* Footer: settings + user */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", px: 1.5, py: 1.5 }}>
        <ListItemButton
          disabled
          sx={{
            borderRadius: 2,
            mb: 0.5,
            "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.7)", minWidth: 38 },
          }}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            slotProps={{ primary: { sx: { fontSize: 14, color: "rgba(255,255,255,0.75)" } } }}
          />
        </ListItemButton>

        <Stack direction="row" spacing={1.5} sx={{ px: 1, py: 0.5, alignItems: "center" }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.gold, color: COLORS.sidebarBg, fontSize: 13, fontWeight: 700 }}>
            {initials(user?.full_name) || "?"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" color="#fff" noWrap sx={{ fontWeight: 600 }}>
              {user?.full_name || "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }} noWrap>
              {user?.role || ""}
            </Typography>
          </Box>
          <Tooltip title="Log out">
            <IconButton size="small" onClick={onLogout} sx={{ color: "rgba(255,255,255,0.7)" }}>
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default Sidebar;
