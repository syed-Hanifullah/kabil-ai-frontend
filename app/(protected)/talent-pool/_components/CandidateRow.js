"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
  timeAgo,
  toScore,
  poolMatchColor,
  scoreBand,
  authenticityBandChip,
} from "@/lib/kabil/constants";

/** Two-letter initials for the avatar; falls back to a person glyph. */
const initials = (name) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "🧑";

const SKILLS_SHOWN = 2;

const skillChipSx = {
  bgcolor: "#efe8d3",
  color: "#5b4f2c",
  fontWeight: 600,
  borderRadius: 1,
  height: 20,
  "& .MuiChip-label": { px: 0.75 },
};

/**
 * One pooled candidate as a table row: Candidate · Role · AI Score · Source ·
 * Status. `entry.similarity_score` (search hits only) drives the AI-score cell;
 * `entry.candidate.authenticity_band` drives the Status chip; `source_job_title`
 * the Source cell. Clicking the row opens the profile; the kebab holds the
 * profile / source-to-job / history actions.
 */
const CandidateRow = ({ entry, onOpen, onSource, onHistory }) => {
  const c = entry.candidate || {};
  const score = toScore(entry.similarity_score);
  const band = scoreBand(entry.similarity_score);
  const status = authenticityBandChip(c.authenticity_band);
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
          <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700, fontSize: 14, width: 38, height: 38 }}>
            {initials(c.full_name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700 }}>
              {c.full_name || "Unnamed candidate"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              added {timeAgo(entry.added_at)}
              {!entry.is_active && " · Expired"}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Role + skills */}
      <TableCell>
        {c.role ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
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

      {/* AI score (search/job-match only) */}
      <TableCell>
        {score != null ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip size="small" color={poolMatchColor(score)} label={band.label} sx={{ fontWeight: 700 }} />
            <Typography sx={{ fontWeight: 700 }}>{Math.round(score)}</Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>

      {/* Source */}
      <TableCell>
        <Typography variant="body2" color="text.secondary" noWrap>
          {source}
        </Typography>
      </TableCell>

      {/* Status (authenticity band) */}
      <TableCell>
        <Chip size="small" variant="outlined" color={status.color} label={status.label} />
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
