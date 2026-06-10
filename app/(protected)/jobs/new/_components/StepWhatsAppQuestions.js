"use client";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { QUESTION_CATEGORIES } from "@/lib/kabil/jobOptions";

const MAX_QUESTIONS = 10;

/** New custom questions need a unique, backend-shaped id ("q_" + 8 chars). */
const newQuestionId = () =>
  "q_" + crypto.randomUUID().replace(/-/g, "").slice(0, 8);

/**
 * Review/edit step for the WhatsApp screening questions the backend generated
 * when the job was opened. Questions are held in page state (not react-hook-form)
 * because they carry fields the form doesn't — `order`, `question_ar`,
 * `reasoning` — that we must round-trip back on save.
 */
const StepWhatsAppQuestions = ({ questions, onChange }) => {
  const update = (index, patch) =>
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));

  // Keep `order` contiguous (1..N) so the save payload stays valid.
  const renumber = (list) => list.map((q, i) => ({ ...q, order: i + 1 }));

  const removeAt = (index) =>
    onChange(renumber(questions.filter((_, i) => i !== index)));

  const addQuestion = () =>
    onChange([
      ...questions,
      {
        id: newQuestionId(),
        order: questions.length + 1,
        category: "background_validation",
        subcategory: "",
        question_en: "",
        question_ar: "",
        reasoning: "",
        is_ai_generated: false,
        source_field: null,
      },
    ]);

  return (
    <Stack spacing={2.5}>
      <Alert severity="success" variant="outlined">
        These WhatsApp screening questions were AI-generated from the role details.
        Review, tweak the wording, or add your own — the final list (saved when you
        finish) is what candidates are asked.
      </Alert>

      {questions.length === 0 && (
        <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
          <Typography>No questions were generated. Add your own below.</Typography>
        </Box>
      )}

      {questions.map((q, index) => (
        <Card key={q.id} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            <Typography color="text.secondary" sx={{ pt: 1.5, fontWeight: 700 }}>
              {index + 1}
            </Typography>
            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Question (English)"
                value={q.question_en}
                onChange={(e) => update(index, { question_en: e.target.value })}
              />
              {q.question_ar !== undefined && (
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  label="Question (Arabic)"
                  dir="rtl"
                  value={q.question_ar}
                  onChange={(e) => update(index, { question_ar: e.target.value })}
                />
              )}
              <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  select
                  label="Category"
                  size="small"
                  sx={{ minWidth: 220 }}
                  value={q.category}
                  onChange={(e) => update(index, { category: e.target.value })}
                >
                  {QUESTION_CATEGORIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
                {q.is_ai_generated ? (
                  <Chip size="small" color="secondary" label="✨ AI" sx={{ fontWeight: 600 }} />
                ) : (
                  <Chip size="small" variant="outlined" label="Custom" />
                )}
                {q.reasoning && (
                  <Tooltip title={q.reasoning} arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: "text.disabled", cursor: "help" }} />
                  </Tooltip>
                )}
              </Stack>
            </Stack>
            <IconButton onClick={() => removeAt(index)} aria-label="Remove question">
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        </Card>
      ))}

      <Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          disabled={questions.length >= MAX_QUESTIONS}
          onClick={addQuestion}
        >
          Add question
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          {questions.length} / {MAX_QUESTIONS}
        </Typography>
      </Box>
    </Stack>
  );
};

export default StepWhatsAppQuestions;
