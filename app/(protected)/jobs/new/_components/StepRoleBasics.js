"use client";

import { useFormContext, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TagsInput from "@/components/TagsInput";
import FieldLabel from "./FieldLabel";
import {
  COUNTRIES,
  CURRENCIES,
  LANGUAGES,
  NOTICE_PERIOD_OPTIONS,
  VISA_OPTIONS,
  NATIONALITY_OPTIONS,
} from "@/lib/kabil/jobOptions";

/** Two-column responsive grid row. */
const Grid = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gap: 3,
      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
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
    formState: { errors },
  } = useFormContext();

  return (
    <Stack spacing={3}>
      {/* Title / Company */}
      <Grid>
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
      </Grid>

      {/* Country / City */}
      <Grid>
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
        <Field>
          <FieldLabel label="City" required />
          <TextField
            fullWidth
            placeholder="e.g. Dubai"
            error={!!errors.city}
            helperText={errors.city?.message}
            {...register("city", { required: "City is required" })}
          />
        </Field>
      </Grid>

      {/* Employment Type / Work Mode */}
      <Grid>
        <Field>
          <FieldLabel label="Employment Type" required />
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
          <FieldLabel label="Work Mode" required />
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

      {/* Min Experience / Currency */}
      <Grid>
        <Field>
          <FieldLabel label="Min Experience (years)" required hardFilter />
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

      {/* Min / Max salary */}
      <Grid>
        <Field>
          <FieldLabel label="Min Salary (per month)" />
          <TextField
            fullWidth
            type="number"
            placeholder="0"
            inputProps={{ min: 0 }}
            error={!!errors.min_salary}
            helperText={errors.min_salary?.message}
            {...register("min_salary", {
              min: { value: 0, message: "Must be 0 or more" },
            })}
          />
        </Field>
        <Field>
          <FieldLabel label="Max Salary (per month)" />
          <TextField
            fullWidth
            type="number"
            placeholder="0"
            inputProps={{ min: 0 }}
            error={!!errors.max_salary}
            helperText={errors.max_salary?.message}
            {...register("max_salary", {
              min: { value: 0, message: "Must be 0 or more" },
              validate: (v, values) =>
                v === "" ||
                values.min_salary === "" ||
                Number(v) >= Number(values.min_salary) ||
                "Max salary must be ≥ min salary",
            })}
          />
        </Field>
      </Grid>

      {/* Notice period */}
      <Box sx={{ maxWidth: { md: "calc(50% - 12px)" } }}>
        <FieldLabel label="Notice Period" />
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
      </Box>

      {/* Visa / Nationality */}
      <Grid>
        <Field>
          <FieldLabel label="Visa Requirement" />
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
          <FieldLabel label="Nationality Preference" />
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
      </Grid>

      {/* Languages */}
      <Box>
        <FieldLabel label="Languages Required" />
        <Controller
          control={control}
          name="languages_required"
          render={({ field }) => (
            <FormGroup row>
              {LANGUAGES.map((lang) => {
                const checked = field.value.includes(lang);
                return (
                  <FormControlLabel
                    key={lang}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) =>
                          field.onChange(
                            e.target.checked
                              ? [...field.value, lang]
                              : field.value.filter((l) => l !== lang),
                          )
                        }
                      />
                    }
                    label={lang}
                  />
                );
              })}
            </FormGroup>
          )}
        />
      </Box>

      {/* Skills */}
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
      <Box>
        <FieldLabel label="Preferred Skills (optional)" />
        <Controller
          control={control}
          name="preferred_skills"
          render={({ field }) => (
            <TagsInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Nice-to-have skills (e.g. Power BI, CFA)"
            />
          )}
        />
      </Box>
    </Stack>
  );
};

export default StepRoleBasics;
