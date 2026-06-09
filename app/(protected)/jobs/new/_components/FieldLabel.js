"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { COLORS } from "@/lib/theme";

/** A field header: label (+ required *, + optional HARD FILTER badge). */
const FieldLabel = ({ label, required, hardFilter }) => (
  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75, minHeight: 24 }}>
    {label}
    {required && " *"}
    {hardFilter && (
      <Box
        component="span"
        sx={{
          ml: 1,
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: COLORS.gold,
          bgcolor: "rgba(201,162,63,0.14)",
        }}
      >
        HARD FILTER
      </Box>
    )}
  </Typography>
);

export default FieldLabel;
