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
import { COUNTRIES, CURRENCIES } from "@/lib/kabil/jobOptions";

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
    formState: { errors },
  } = useFormContext();

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
              <FieldLabel label="City" required />
              <TextField
                fullWidth
                placeholder="e.g. Dubai"
                error={!!errors.city}
                helperText={errors.city?.message}
                {...register("city", { required: "City is required" })}
              />
            </Field>
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

          {/* Employment Type / Work Mode */}
          <Grid cols={2}>
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
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StepRoleBasics;
