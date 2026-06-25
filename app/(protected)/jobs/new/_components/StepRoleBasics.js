"use client";

import { useFormContext, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TagsInput from "@/components/TagsInput";
import FieldLabel from "./FieldLabel";
import ScreeningCheckbox from "./ScreeningCheckbox";
import {
  COUNTRIES,
  CURRENCIES,
  NOTICE_PERIOD_OPTIONS,
  VISA_OPTIONS,
  NATIONALITY_OPTIONS,
  LANGUAGES,
} from "@/lib/kabil/jobOptions";

/** Responsive grid: `cols` columns on md+, single column on xs. */
const Grid = ({ cols = 2, children }) => (
  <Box
    sx={{
      display: "grid",
      gap: 3,
      gridTemplateColumns: { xs: "1fr", md: `repeat(${cols}, 1fr)` },
    }}
  >
    {children}
  </Box>
);

const Field = ({ children }) => <Box>{children}</Box>;

const StepRoleBasics = () => {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();

  // Salary labels track the chosen currency (e.g. "Min Salary (AED per month)").
  const currency = watch("currency") || "AED";

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Role Details
        </Typography>

        <Stack spacing={3}>
          {/* Title / Company / Country */}
          <Grid cols={3}>
            <Field>
              <FieldLabel label="Job Title" required />
              <TextField
                fullWidth
                placeholder="e.g. Senior Finance Analyst"
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", {
                  required: "Job title is required",
                  maxLength: { value: 255, message: "Max 255 characters" },
                })}
              />
            </Field>
            <Field>
              <FieldLabel label="Hiring Company" required />
              <TextField
                fullWidth
                placeholder="e.g. DAMAC Properties"
                error={!!errors.hiring_company}
                helperText={errors.hiring_company?.message}
                {...register("hiring_company", {
                  required: "Hiring company is required",
                  maxLength: { value: 255, message: "Max 255 characters" },
                })}
              />
            </Field>
            <Field>
              <FieldLabel label="Country" required />
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <TextField select fullWidth {...field}>
                    {COUNTRIES.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.flag} {c.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Field>
          </Grid>

          {/* City / Min Experience / Currency */}
          <Grid cols={3}>
            <Field>
              <FieldLabel
                label="City"
                required
                action={<ScreeningCheckbox name="city" />}
              />
              <TextField
                fullWidth
                placeholder="e.g. Dubai"
                error={!!errors.city}
                helperText={errors.city?.message}
                {...register("city", { required: "City is required" })}
              />
            </Field>
            <Field>
              <FieldLabel
                label="Min Experience (years)"
                required
                action={<ScreeningCheckbox name="min_experience" disabled />}
              />
              <TextField
                fullWidth
                type="number"
                inputProps={{ min: 0, max: 50 }}
                error={!!errors.min_experience_years}
                helperText={errors.min_experience_years?.message}
                {...register("min_experience_years", {
                  required: "Required",
                  min: { value: 0, message: "Must be 0 or more" },
                  max: { value: 50, message: "Must be 50 or less" },
                  valueAsNumber: true,
                })}
              />
            </Field>
            <Field>
              <FieldLabel label="Currency" />
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <TextField select fullWidth {...field}>
                    {CURRENCIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Field>
          </Grid>

          {/* Min Salary / Max Salary / Notice period */}
          <Grid cols={3}>
            <Field>
              <FieldLabel
                label={`Min Salary (${currency} per month)`}
                required
                action={<ScreeningCheckbox name="min_salary" />}
              />
              <TextField
                fullWidth
                type="number"
                placeholder="0"
                inputProps={{ min: 0 }}
                error={!!errors.min_salary}
                helperText={errors.min_salary?.message}
                {...register("min_salary", {
                  required: "Min salary is required",
                  min: { value: 0, message: "Must be 0 or more" },
                })}
              />
            </Field>
            <Field>
              <FieldLabel label={`Max Salary (${currency} per month)`} required />
              <TextField
                fullWidth
                type="number"
                placeholder="0"
                inputProps={{ min: 0 }}
                error={!!errors.max_salary}
                helperText={errors.max_salary?.message}
                {...register("max_salary", {
                  required: "Max salary is required",
                  min: { value: 0, message: "Must be 0 or more" },
                  validate: (v) => {
                    const min = getValues("min_salary");
                    if (v === "" || min === "" || min == null) return true;
                    return Number(v) >= Number(min) || "Max must be ≥ min salary";
                  },
                })}
              />
            </Field>
            <Field>
              <FieldLabel
                label="Immediate Join"
                action={<ScreeningCheckbox name="notice_period" />}
              />
              <Controller
                control={control}
                name="notice_period"
                render={({ field }) => (
                  <TextField select fullWidth {...field}>
                    {NOTICE_PERIOD_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Field>
          </Grid>

          {/* Visa / Nationality / Languages */}
          <Grid cols={3}>
            <Field>
              <FieldLabel
                label="Visa Requirement"
                action={<ScreeningCheckbox name="visa_requirement" />}
              />
              <Controller
                control={control}
                name="visa_requirement"
                render={({ field }) => (
                  <TextField select fullWidth {...field}>
                    {VISA_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.icon} {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Field>
            <Field>
              <FieldLabel
                label="Nationality Preference"
                action={<ScreeningCheckbox name="nationality_preference" />}
              />
              <Controller
                control={control}
                name="nationality_preference"
                render={({ field }) => (
                  <TextField select fullWidth {...field}>
                    {NATIONALITY_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.icon} {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Field>
            <Field>
              <FieldLabel
                label="Languages Required"
                action={<ScreeningCheckbox name="languages_required" />}
              />
              <Controller
                control={control}
                name="languages_required"
                render={({ field }) => (
                  <ToggleButtonGroup
                    value={field.value}
                    onChange={(_, v) => field.onChange(v)}
                    fullWidth
                  >
                    {LANGUAGES.map((lang) => (
                      <ToggleButton key={lang} value={lang}>
                        {lang}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              />
            </Field>
          </Grid>

          {/* Employment Type / Work Mode */}
          <Grid cols={2}>
            <Field>
              <FieldLabel
                label="Employment Type"
                required
                action={<ScreeningCheckbox name="employment_type" />}
              />
              <Controller
                control={control}
                name="employment_type"
                render={({ field }) => (
                  <ToggleButtonGroup
                    exclusive
                    value={field.value}
                    onChange={(_, v) => v && field.onChange(v)}
                    fullWidth
                  >
                    <ToggleButton value="permanent">Permanent</ToggleButton>
                    <ToggleButton value="contract">Contract</ToggleButton>
                    <ToggleButton value="temporary">Temporary</ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Field>
            <Field>
              <FieldLabel
                label="Work Mode"
                required
                action={<ScreeningCheckbox name="work_mode" />}
              />
              <Controller
                control={control}
                name="work_mode"
                render={({ field }) => (
                  <ToggleButtonGroup
                    exclusive
                    value={field.value}
                    onChange={(_, v) => v && field.onChange(v)}
                    fullWidth
                  >
                    <ToggleButton value="onsite">Onsite</ToggleButton>
                    <ToggleButton value="hybrid">Hybrid</ToggleButton>
                    <ToggleButton value="remote">Remote</ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Field>
          </Grid>

          {/* Required skills */}
          <Box>
            <FieldLabel label="Required Skills" required hardFilter />
            <Controller
              control={control}
              name="required_skills"
              rules={{
                validate: (v) => v.length > 0 || "Add at least one required skill",
              }}
              render={({ field }) => (
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type a skill and press Enter (e.g. IFRS, SAP, Excel)"
                  error={!!errors.required_skills}
                  helperText={errors.required_skills?.message}
                />
              )}
            />
          </Box>

          {/* Preferred skills */}
          <Box>
            <FieldLabel label="Preferred Skills" />
            <Controller
              control={control}
              name="preferred_skills"
              render={({ field }) => (
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Nice to have skills (e.g. Power BI, CFA)"
                />
              )}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StepRoleBasics;
