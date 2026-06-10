"use client";

import { useFormContext } from "react-hook-form";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

const MAX = 20000;

const StepJdBuilder = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const jd = watch("job_description") || "";

  return (
    <Stack spacing={2}>
      <Alert severity="info" variant="outlined">
        Paste an existing job description, or write one here. This is embedded and
        used to score candidate CVs for relevance.
      </Alert>

      <div>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
          Job Description *
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={12}
          placeholder="Paste or write the full job description…"
          error={!!errors.job_description}
          helperText={errors.job_description?.message}
          {...register("job_description", {
            required: "Job description is required",
            maxLength: { value: MAX, message: `Max ${MAX.toLocaleString()} characters` },
          })}
        />
        <Typography
          variant="caption"
          color={jd.length > MAX ? "error" : "text.secondary"}
          sx={{ display: "block", textAlign: "right", mt: 0.5 }}
        >
          {jd.length.toLocaleString()} / {MAX.toLocaleString()}
        </Typography>
      </div>
    </Stack>
  );
};

export default StepJdBuilder;
