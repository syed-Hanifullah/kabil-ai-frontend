"use client";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { QUESTION_CATEGORIES, questionCategoryLabel } from "@/lib/kabil/jobOptions";

const MAX_QUESTIONS = 15;

/** New custom questions need a unique, backend-shaped id ("q_" + 8 chars). */
const newQuestionId = () =>
  "q_" + crypto.randomUUID().replace(/-/g, "").slice(0, 8);

/** A question HR can edit/remove — only the ones they add themselves. */
const isCustom = (q) => !q.source_field && !q.is_ai_generated;

/**
 * Review step for a job's WhatsApp screening questions. The backend generates a
 * fixed set (locked) plus a few AI background-validation questions (locked, and
 * the only ones whose answers the AI scores). HR can only *add their own*
 * custom questions here. Questions are held in page state (not react-hook-form)
 * because they carry fields the form doesn't — `order`, `question_ar`,
 * `reasoning` — that we round-trip back on save.
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
        category: "commitment",
        subcategory: "",
        question_en: "",
        question_ar: "",
        reasoning: "",
        is_ai_generated: false,
        source_field: null,
        ai_verifies_response: false,
      },
    ]);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        {/* Header */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Screening Questions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sent to every candidate via WhatsApp after CV approval. The fixed
          questions and the AI background-validation checks are set automatically
          and can&apos;t be edited — only the AI checks have their answers scored
          by AI. You can add your own custom questions below.
        </Typography>

        <Stack spacing={2}>
          {questions.length === 0 && (
            <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
              <Typography>No questions yet. Add your own below.</Typography>
            </Box>
          )}

          {questions.map((q, index) => {
            const editable = isCustom(q);
            return (
              <Box
                key={q.id}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(0,0,0,0.015)",
                  p: 2,
                }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      mt: 0.5,
                      width: 26,
                      height: 26,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "primary.main",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                    {editable ? (
                      <>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Question (English)"
                          value={q.question_en}
                          onChange={(e) => update(index, { question_en: e.target.value })}
                        />
                        <TextField
                          fullWidth
                          multiline
                          minRows={1}
                          label="Question (Arabic)"
                          dir="rtl"
                          value={q.question_ar}
                          onChange={(e) => update(index, { question_ar: e.target.value })}
                        />
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontWeight: 600 }}>{q.question_en}</Typography>
                        {q.question_ar && (
                          <Typography color="text.secondary" dir="rtl">
                            {q.question_ar}
                          </Typography>
                        )}
                      </>
                    )}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      useFlexGap
                      sx={{ alignItems: "center", flexWrap: "wrap" }}
                    >
                      {editable ? (
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
                      ) : (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={questionCategoryLabel(q.category)}
                        />
                      )}
                      {q.source_field ? (
                        <Chip
                          size="small"
                          color="primary"
                          variant="outlined"
                          label="Fixed"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : q.is_ai_generated ? (
                        <Tooltip title="AI-generated — the candidate's answer is scored by AI" arrow>
                          <Chip
                            size="small"
                            color="secondary"
                            label="✨ AI"
                            sx={{ fontWeight: 600 }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip size="small" variant="outlined" label="Custom" />
                      )}
                      {q.reasoning && (
                        <Tooltip title={q.reasoning} arrow>
                          <InfoOutlinedIcon
                            sx={{ fontSize: 18, color: "text.disabled", cursor: "help" }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                  {editable && (
                    <IconButton onClick={() => removeAt(index)} aria-label="Remove question">
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <Box sx={{ mt: 2.5 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={questions.length >= MAX_QUESTIONS}
            onClick={addQuestion}
            sx={{ borderRadius: 2 }}
          >
            Add Custom Question
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {questions.length} / {MAX_QUESTIONS}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepWhatsAppQuestions;
