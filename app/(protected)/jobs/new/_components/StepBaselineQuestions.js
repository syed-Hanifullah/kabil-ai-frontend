"use client";

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { QUESTION_CATEGORIES } from "@/lib/kabil/jobOptions";

const MAX_QUESTIONS = 10;

const StepBaselineQuestions = () => {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "baseline_questions",
  });

  return (
    <Stack spacing={2.5}>
      <Alert severity="info" variant="outlined">
        Baseline questions are asked during WhatsApp screening. Add your own here —
        the AI also generates questions from the role details when the job opens, and
        you can refine the full list later.
      </Alert>

      {fields.length === 0 && (
        <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
          <Typography>No baseline questions yet.</Typography>
        </Box>
      )}

      {fields.map((item, index) => (
        <Card key={item.id} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography fontWeight={700} color="text.secondary" sx={{ pt: 1.5 }}>
              {index + 1}
            </Typography>
            <Stack spacing={1.5} sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="e.g. Are you available to start within 30 days?"
                {...register(`baseline_questions.${index}.question_en`)}
              />
              <Controller
                control={control}
                name={`baseline_questions.${index}.category`}
                render={({ field }) => (
                  <TextField select label="Category" sx={{ maxWidth: 260 }} {...field}>
                    {QUESTION_CATEGORIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <IconButton onClick={() => remove(index)} aria-label="Remove question">
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        </Card>
      ))}

      <Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          disabled={fields.length >= MAX_QUESTIONS}
          onClick={() =>
            append({ question_en: "", category: "background_validation" })
          }
        >
          Add question
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          {fields.length} / {MAX_QUESTIONS}
        </Typography>
      </Box>
    </Stack>
  );
};

export default StepBaselineQuestions;
