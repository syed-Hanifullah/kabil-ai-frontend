"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  CONTACT_COLORS,
  CONTACT_FIELDS,
  CONTACT_HEADER,
  CONTACT_LAYOUT,
  CONTACT_TYPOGRAPHY,
} from "@/lib/kabil/landing";

// Shared white input look (text field + textarea).
const fieldBaseSx = {
  ...CONTACT_TYPOGRAPHY.field,
  width: "100%",
  boxSizing: "border-box",
  px: 2,
  bgcolor: CONTACT_COLORS.fieldBg,
  color: CONTACT_COLORS.fieldText,
  border: `${CONTACT_LAYOUT.field.borderWidth}px solid ${CONTACT_COLORS.fieldBorder}`,
  borderRadius: `${CONTACT_LAYOUT.field.radius}px`,
  outline: "none",
  "&:focus": { borderColor: CONTACT_COLORS.buttonBg },
};

/** Labelled input (single-line or textarea). */
const Field = ({ field, t }) => (
  <Box sx={{ gridColumn: field.full ? { xs: "auto", md: "1 / -1" } : "auto" }}>
    <Typography
      component="label"
      htmlFor={field.id}
      sx={{ ...CONTACT_TYPOGRAPHY.label, color: CONTACT_COLORS.label, display: "block", mb: 1 }}
    >
      {t(field.labelKey)}
    </Typography>
    {field.multiline ? (
      <Box
        component="textarea"
        id={field.id}
        name={field.id}
        placeholder={t(field.placeholderKey)}
        sx={{
          ...fieldBaseSx,
          py: 1.5,
          minHeight: CONTACT_LAYOUT.textareaMinHeight,
          resize: "vertical",
          fontFamily: CONTACT_TYPOGRAPHY.field.fontFamily,
        }}
      />
    ) : (
      <Box
        component="input"
        id={field.id}
        name={field.id}
        type={field.type}
        placeholder={t(field.placeholderKey)}
        sx={{ ...fieldBaseSx, height: CONTACT_LAYOUT.field.height }}
      />
    )}
  </Box>
);

/**
 * "Get in touch" — centered eyebrow / heading / sub-heading, then a full-width
 * gradient card holding a demo-request form (static UI for now). All colors,
 * type, copy, and layout come from constants.
 */
const Contact = () => {
  const { t, isRtl } = useLanguage();

  // Static for now — no backend wiring yet.
  const handleSubmit = (e) => e.preventDefault();

  return (
    <Box component="section" id="contact" sx={{ bgcolor: "#FFFFFF" }}>
      {/* Header block (white) */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2.5, md: 5, lg: 8 }, py: { xs: 8, md: 10 } }}>
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography sx={{ ...CONTACT_TYPOGRAPHY.eyebrow, color: CONTACT_COLORS.eyebrow }}>
            {t(CONTACT_HEADER.eyebrowKey)}
          </Typography>
          <Typography component="h2" sx={{ ...CONTACT_TYPOGRAPHY.heading, color: CONTACT_COLORS.heading }}>
            {t(CONTACT_HEADER.headingKey)}
          </Typography>
          <Typography sx={{ ...CONTACT_TYPOGRAPHY.subheading, color: CONTACT_COLORS.subheading }}>
            {t(CONTACT_HEADER.subheadingKey)}
          </Typography>
        </Stack>
      </Box>

      {/* Full-width gradient card with the form */}
      <Box sx={{ background: CONTACT_COLORS.cardBg }}>
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2.5, md: 5, lg: 8 },
            minHeight: { md: CONTACT_LAYOUT.cardHeight },
            display: "flex",
            alignItems: "center",
            py: { xs: 6, md: 8 },
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                columnGap: 3,
                rowGap: 3,
              }}
            >
              {CONTACT_FIELDS.map((field) => (
                <Field key={field.id} field={field} t={t} />
              ))}
            </Box>

            {/* Submit */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 4, md: 5 } }}>
              <Box
                component="button"
                type="submit"
                sx={{
                  ...CONTACT_TYPOGRAPHY.button,
                  color: CONTACT_COLORS.buttonText,
                  bgcolor: CONTACT_COLORS.buttonBg,
                  border: "none",
                  cursor: "pointer",
                  px: 5,
                  py: 1.75,
                  borderRadius: `${CONTACT_LAYOUT.button.radius}px`,
                  boxShadow: CONTACT_LAYOUT.button.shadow,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {t(CONTACT_HEADER.submitKey)}
                <Box component="span" sx={{ display: "inline-flex", transform: isRtl ? "scaleX(-1)" : "none" }}>
                  →
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Contact;
