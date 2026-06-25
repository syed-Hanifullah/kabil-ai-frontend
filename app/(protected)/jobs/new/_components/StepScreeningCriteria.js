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
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { SCREENING_FIELDS, questionCategoryLabel } from "@/lib/kabil/jobOptions";

/** MUI chip color per question category. */
const CATEGORY_COLOR = {
  commitment: "info",
  salary: "warning",
  background_validation: "secondary",
};

const StepScreeningCriteria = () => {
  const { watch } = useFormContext();
  const minExp = watch("min_experience_years");
  const skills = watch("required_skills") || [];
  const screening = watch("screening") || {};

  // Fields HR ticked "ask on WhatsApp", in canonical order.
  const selected = SCREENING_FIELDS.filter((f) => screening[f.key]);

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
          Two locked hard filters apply to every CV. Anything else you ticked on Role Basics
          becomes a WhatsApp screening question — not a filter.
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

        {/* WhatsApp screening questions (from the ticked Role Basics fields) */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between", mt: 4, mb: 0.5 }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ChatBubbleOutlineIcon fontSize="small" sx={{ color: "primary.main" }} />
            <Typography sx={{ fontWeight: 700 }}>WhatsApp screening questions</Typography>
          </Stack>
          <Chip
            size="small"
            color="primary"
            label={`${selected.length} selected`}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Each field you ticked on Role Basics becomes a question candidates answer over
          WhatsApp. The AI then adds up to three Background Validation checks.
        </Typography>

        {selected.length === 0 ? (
          <Box
            sx={{
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
              p: 2.5,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No fields ticked. Go back to Role Basics and check &ldquo;Ask on WhatsApp&rdquo;
              on the fields you want candidates asked about.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {selected.map((f) => (
              <Stack
                key={f.key}
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  px: 2,
                  py: 1.25,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{f.label}</Typography>
                  {f.locked && (
                    <Chip size="small" variant="outlined" label="Always asked" />
                  )}
                </Stack>
                <Chip
                  size="small"
                  color={CATEGORY_COLOR[f.category] || "default"}
                  variant="outlined"
                  label={questionCategoryLabel(f.category)}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            ))}
          </Stack>
        )}

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
            You can edit, reorder, or remove every question on the next step before the job
            goes live.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepScreeningCriteria;
