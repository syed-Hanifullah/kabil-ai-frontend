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
import { questionCategoryLabel } from "@/lib/kabil/jobOptions";

/** MUI chip color per question category. */
const CATEGORY_COLOR = {
  commitment: "info",
  salary: "warning",
  background_validation: "secondary",
};

/**
 * The fixed WhatsApp questions every candidate is asked, mirroring the backend
 * set (`src.enums.fixed_screening_questions`). Display-only — the exact wording
 * is rendered server-side with the job's details on the next step.
 */
const FIXED_TOPICS = [
  { label: "Reason for moving", category: "commitment" },
  { label: "Salary expectations", category: "salary" },
  { label: "Notice period", category: "commitment" },
  { label: "Visa / residency status", category: "background_validation" },
  { label: "Employment type", category: "commitment" },
  { label: "Work mode", category: "commitment" },
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
          Two locked hard filters apply to every CV. After that, every candidate is asked a
          fixed set of WhatsApp questions plus a few AI background-validation checks.
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
      </CardContent>
    </Card>
  );
};

export default StepScreeningCriteria;
