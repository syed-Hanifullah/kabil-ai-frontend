"use client";

import { useFormContext } from "react-hook-form";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

/** Advisory score bands — fixed system defaults (not configurable). */
const BANDS = [
  {
    key: "advance",
    label: "Advance",
    range: "Score ≥ 75",
    blurb: "Strong match — push to the top of your review queue.",
    icon: CheckCircleOutlineIcon,
    color: "#1f9d57",
    bg: "#e7f1ea",
  },
  {
    key: "hold",
    label: "Hold",
    range: "Score 55–74",
    blurb: "Borderline — worth a closer read before deciding.",
    icon: PauseCircleOutlineIcon,
    color: "#b7891f",
    bg: "#faf3e0",
  },
  {
    key: "reject",
    label: "Reject",
    range: "Score < 55",
    blurb: "Weak match — flagged low, but still yours to review.",
    icon: HighlightOffIcon,
    color: "#d24a45",
    bg: "#fdeceb",
  },
];

const StepScreeningCriteria = () => {
  const { watch } = useFormContext();
  const minExp = watch("min_experience_years");
  const skills = watch("required_skills") || [];

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
          <VerifiedOutlinedIcon sx={{ color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AI Screening Criteria
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Two locked hard filters apply to every CV. Anything else you flagged becomes a
          WhatsApp screening question — not a filter.
        </Typography>

        {/* Hard filters (read-only echo of Role Basics) */}
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "rgba(201,162,63,0.4)",
            bgcolor: "rgba(201,162,63,0.06)",
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <ShieldOutlinedIcon fontSize="small" sx={{ color: "secondary.main" }} />
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Hard filters</Typography>
                <Typography variant="caption" color="text.secondary">
                  Always enforced — applied before any scoring.
                </Typography>
              </Box>
            </Stack>
            <Chip size="small" color="secondary" label="2 active" sx={{ fontWeight: 700 }} />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Box sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 1.75 }}>
              <Typography variant="caption" color="text.secondary">
                Minimum experience — candidates below this are rejected before scoring.
              </Typography>
              <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
                {minExp === 1 ? "1 year" : `${minExp || 0} years`}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 1.75 }}>
              <Typography variant="caption" color="text.secondary">
                Required skills — missing any of these means automatic rejection.
              </Typography>
              <Stack direction="row" sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.75 }}>
                {skills.length ? (
                  skills.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      sx={{
                        bgcolor: "#efe8d3",
                        color: "#5b4f2c",
                        fontWeight: 600,
                        borderRadius: 1,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    None added
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            These mirror Step 1 — edit them in Role Basics.
          </Typography>
        </Box>

        {/* AI recommendation bands */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between", mt: 4, mb: 0.5 }}
        >
          <Typography sx={{ fontWeight: 700 }}>AI recommendation bands</Typography>
          <Chip size="small" variant="outlined" label="System default" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          How the AI flags candidates against the 0–100 fit score.
        </Typography>

        {/* Gradient scale */}
        <Box sx={{ px: 0.5 }}>
          <Box
            sx={{
              height: 8,
              borderRadius: 999,
              background: "linear-gradient(90deg, #d24a45 0%, #e0a93b 55%, #1f9d57 100%)",
            }}
          />
          <Stack direction="row" sx={{ justifyContent: "space-between", mt: 0.5 }}>
            {["0", "55", "75", "100"].map((n) => (
              <Typography key={n} variant="caption" color="text.secondary">
                {n}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            mt: 2,
          }}
        >
          {BANDS.map(({ key, label, range, blurb, icon: Icon, color, bg }) => (
            <Box
              key={key}
              sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", p: 2 }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: bg,
                    color,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color }}>
                  {range}
                </Typography>
              </Stack>
              <Typography sx={{ fontWeight: 700, color }}>{label}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {blurb}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Reassurance footer */}
        <Box
          sx={{
            mt: 2.5,
            borderRadius: 2,
            bgcolor: "rgba(47,125,91,0.08)",
            p: 2,
            display: "flex",
            gap: 1.5,
          }}
        >
          <VerifiedOutlinedIcon fontSize="small" sx={{ color: "primary.main", mt: 0.25 }} />
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              You stay in control.
            </Box>{" "}
            These bands are advisory — the AI never auto-rejects on score alone. Every
            candidate card shows its band, and you Approve, Hold, or Reject from there.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepScreeningCriteria;
