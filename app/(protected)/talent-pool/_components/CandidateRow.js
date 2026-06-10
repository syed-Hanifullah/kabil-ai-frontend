"use client";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { timeAgo, toScore, poolMatchColor } from "@/lib/kabil/constants";

/** Two-letter initials for the avatar; falls back to a person glyph. */
const initials = (name) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "🧑";

const Meta = ({ icon, children }) =>
  children ? (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
      {icon}
      <Typography variant="body2" color="text.secondary" noWrap>
        {children}
      </Typography>
    </Stack>
  ) : null;

/**
 * One pooled candidate. `entry.candidate` is the snapshot; `entry.similarity_score`
 * (search hits only) drives the match chip. Clicking the row opens the candidate's
 * full profile; the row also carries a direct "Source to job" action.
 */
const CandidateRow = ({ entry, onOpen, onSource }) => {
  const c = entry.candidate || {};
  const score = toScore(entry.similarity_score);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(entry);
        }
      }}
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        px: { xs: 2, sm: 2.5 },
        py: 1.75,
        cursor: "pointer",
        transition: "background-color 120ms",
        "&:hover": { bgcolor: "#f6faf7" },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -2,
        },
        "&:not(:last-of-type)": { borderBottom: "1px solid #eef1ef" },
      }}
    >
      <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700, fontSize: 15 }}>
        {initials(c.full_name)}
      </Avatar>

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
          <Typography noWrap sx={{ fontWeight: 700 }}>
            {c.full_name || "Unnamed candidate"}
          </Typography>
          {!entry.is_active && (
            <Chip size="small" label="Expired" variant="outlined" sx={{ height: 20 }} />
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: "wrap", rowGap: 0.25, mt: 0.25 }}
        >
          <Meta icon={<EmailOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />}>
            {c.email}
          </Meta>
          <Meta icon={<PhoneOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />}>
            {c.phone_e164}
          </Meta>
          <Typography variant="body2" color="text.disabled" noWrap>
            added {timeAgo(entry.added_at)}
          </Typography>
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}
      >
        {score != null && (
          <Tooltip title="CV match against your search (0–100)">
            <Chip
              size="small"
              color={poolMatchColor(score)}
              label={`${Math.round(score)} match`}
              sx={{ fontWeight: 700 }}
            />
          </Tooltip>
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<SendOutlinedIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onSource(entry);
          }}
        >
          Source to job
        </Button>
      </Stack>
    </Stack>
  );
};

export default CandidateRow;
