"use client";

import { useFormContext } from "react-hook-form";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

const MIN = 100;
const MAX = 20000;

const StepJdBuilder = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const jd = watch("job_description") || "";

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        {/* Header: title + source toggles */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 0.5 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Job Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paste your existing JD.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<ContentPasteOutlinedIcon />}
              sx={{ borderRadius: 2 }}
            >
              Paste JD
            </Button>
            <Tooltip title="AI JD generation is coming soon">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  disabled
                  startIcon={<AutoAwesomeOutlinedIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  AI Builder · Soon
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Typography
          variant="overline"
          sx={{ display: "block", mt: 2, mb: 1, color: "text.secondary", fontWeight: 700 }}
        >
          About the Role
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={12}
          placeholder="Paste or write the full job description — responsibilities, requirements, and what success looks like…"
          error={!!errors.job_description}
          helperText={errors.job_description?.message}
          {...register("job_description", {
            required: "Job description is required",
            minLength: { value: MIN, message: `Add at least ${MIN} characters` },
            maxLength: { value: MAX, message: `Max ${MAX.toLocaleString()} characters` },
          })}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.015)" } }}
        />
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mt: 0.75 }}
        >
          <Typography variant="caption" color="text.secondary">
            Minimum {MIN} characters
          </Typography>
          <Typography
            variant="caption"
            color={jd.length > MAX ? "error" : "text.secondary"}
          >
            {jd.length.toLocaleString()} / {MAX.toLocaleString()}
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "right" }}>
          Don&apos;t have a JD yet? AI Builder coming soon.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StepJdBuilder;
