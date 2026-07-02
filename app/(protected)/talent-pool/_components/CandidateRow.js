"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { timeAgo, toScore, authenticityBandChip } from "@/lib/kabil/constants";

/** Two-letter initials for the avatar; falls back to a person glyph. */
const initials = (name) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "🧑";

/** Deterministic avatar colour so each candidate keeps a stable hue. */
const AVATAR_COLORS = ["#12766a", "#7b5cd6", "#e07b39", "#2f7fd1", "#d95c5c", "#1f9d57"];
const avatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i += 1) hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
};

const SKILLS_SHOWN = 2;

const skillChipSx = {
  bgcolor: "#f0f1f0",
  color: "#5c665f",
  fontWeight: 600,
  fontSize: "0.7rem",
  borderRadius: 1,
  height: 20,
  "& .MuiChip-label": { px: 0.75 },
};

/** Soft-filled Status pill (dot + label), keyed by the authenticity palette. */
const STATUS_PILL = {
  success: { bg: "#e6f4ec", text: "#1f8a53", dot: "#1f9d57" },
  warning: { bg: "#fdf3e0", text: "#a3701a", dot: "#EF9F27" },
  error: { bg: "#fdeceb", text: "#b3332f", dot: "#e0524f" },
  default: { bg: "#eef0ef", text: "#647067", dot: "#9aa39e" },
};

/** AI-score bar colour: green (high) · amber (mid) · red (low). */
const scoreColor = (n) => (n >= 80 ? "#1f9d57" : n >= 60 ? "#EF9F27" : "#e0524f");

/**
 * One pooled candidate as a table row: Candidate · Role · AI Score · Source ·
 * Status. `entry.similarity_score` (search hits only) drives the AI-score bar;
 * `entry.candidate.authenticity_band` drives the Status pill; `source_job_title`
 * the Source cell. Clicking the row opens the profile; the kebab holds the
 * profile / source-to-job / history actions.
 */
const CandidateRow = ({ entry, onOpen, onSource, onHistory }) => {
  const c = entry.candidate || {};
  const score = toScore(entry.similarity_score);
  const status = authenticityBandChip(c.authenticity_band);
  const pill = STATUS_PILL[status.color] ?? STATUS_PILL.default;
  const skills = c.skills ?? [];
  const extraSkills = Math.max(0, skills.length - SKILLS_SHOWN);
  const source = entry.source_job_title || "Direct upload";

  const [menuAnchor, setMenuAnchor] = useState(null);
  const openMenu = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const closeMenu = (e) => {
    e?.stopPropagation();
    setMenuAnchor(null);
  };
  const pick = (fn) => (e) => {
    e.stopPropagation();
    setMenuAnchor(null);
    fn(entry);
  };

  return (
    <TableRow hover onClick={() => onOpen(entry)} sx={{ cursor: "pointer" }}>
      {/* Candidate */}
      <TableCell>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
          <Avatar
            sx={{ bgcolor: avatarColor(c.full_name), fontWeight: 700, fontSize: 13, width: 40, height: 40 }}
          >
            {initials(c.full_name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
              {c.full_name || "Unnamed candidate"}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary" }}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption" noWrap>
                Added {timeAgo(entry.added_at)}
                {!entry.is_active && " · Expired"}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </TableCell>

      {/* Role + skills */}
      <TableCell>
        {c.role ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {c.role}
            </Typography>
            {skills.length > 0 && (
              <Stack direction="row" sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                {skills.slice(0, SKILLS_SHOWN).map((s) => (
                  <Chip key={s} label={s} size="small" sx={skillChipSx} />
                ))}
                {extraSkills > 0 && <Chip label={`+${extraSkills}`} size="small" sx={skillChipSx} />}
              </Stack>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>

      {/* AI score (search/job-match only) — number over a progress bar */}
      <TableCell>
        {score != null ? (
          <Box sx={{ minWidth: 110 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", textAlign: "right", lineHeight: 1.2 }}>
              {Math.round(score)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, score))}
              sx={{
                mt: 0.5,
                height: 6,
                borderRadius: 999,
                bgcolor: "#eef0ef",
                "& .MuiLinearProgress-bar": { borderRadius: 999, backgroundColor: scoreColor(score) },
              }}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>

      {/* Source */}
      <TableCell>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: "0.82rem" }}>
          {source}
        </Typography>
      </TableCell>

      {/* Status (authenticity band) */}
      <TableCell>
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            bgcolor: pill.bg,
          }}
        >
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: pill.dot, flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: pill.text }}>
            {status.label}
          </Typography>
        </Stack>
      </TableCell>

      {/* Actions */}
      <TableCell align="right" sx={{ width: 48 }}>
        <IconButton size="small" aria-label="Candidate actions" onClick={openMenu}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={pick(onOpen)}>
            <ListItemIcon>
              <VisibilityOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={pick(onSource)}>
            <ListItemIcon>
              <SendOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Source to job</ListItemText>
          </MenuItem>
          {onHistory && (
            <MenuItem onClick={pick(onHistory)}>
              <ListItemIcon>
                <HistoryOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View history</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </TableCell>
    </TableRow>
  );
};

export default CandidateRow;
