"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useCreateJob } from "@/lib/kabil/queries";
import { visaApiValue, nationalityApiList } from "@/lib/kabil/jobOptions";
import ErrorAlert from "@/components/ErrorAlert";
import StepRoleBasics from "./_components/StepRoleBasics";
import StepJdBuilder from "./_components/StepJdBuilder";
import StepBaselineQuestions from "./_components/StepBaselineQuestions";

const STEPS = [
  {
    label: "Role Basics",
    component: StepRoleBasics,
    fields: [
      "title",
      "hiring_company",
      "country",
      "city",
      "employment_type",
      "work_mode",
      "min_experience_years",
      "currency",
      "min_salary",
      "max_salary",
      "required_skills",
    ],
  },
  { label: "JD Builder", component: StepJdBuilder, fields: ["job_description"] },
  { label: "Baseline Questions", component: StepBaselineQuestions, fields: [] },
];

const DEFAULT_VALUES = {
  title: "",
  hiring_company: "",
  country: "AE",
  city: "",
  employment_type: "permanent",
  work_mode: "onsite",
  min_experience_years: 0,
  currency: "AED",
  min_salary: "",
  max_salary: "",
  notice_period: "any",
  visa_requirement: "any",
  nationality_preference: "any",
  languages_required: ["English"],
  required_skills: [],
  preferred_skills: [],
  job_description: "",
  baseline_questions: [],
};

/** Strip the form-only fields and coerce types into a JobCreateRequest. */
const toJobPayload = (v) => ({
  title: v.title.trim(),
  hiring_company: v.hiring_company.trim(),
  country: v.country,
  city: v.city.trim(),
  employment_type: v.employment_type,
  work_mode: v.work_mode,
  currency: v.currency,
  min_salary: v.min_salary === "" ? null : Number(v.min_salary),
  max_salary: v.max_salary === "" ? null : Number(v.max_salary),
  notice_period: v.notice_period || null,
  min_experience_years: Number(v.min_experience_years),
  required_skills: v.required_skills,
  preferred_skills: v.preferred_skills,
  visa_requirement: visaApiValue(v.visa_requirement),
  nationality_preference: nationalityApiList(v.nationality_preference),
  languages_required: v.languages_required,
  job_description: v.job_description.trim(),
});

const NewJobPage = () => {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const createJob = useCreateJob();

  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const isLast = active === STEPS.length - 1;
  const StepComponent = STEPS[active].component;

  const handleNext = async () => {
    const ok = await methods.trigger(STEPS[active].fields);
    if (ok) setActive((s) => s + 1);
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    // Note: baseline_questions aren't part of the create payload — they map to
    // the WhatsApp-questions flow that runs after the job is opened.
    const { id } = await createJob.mutateAsync(toJobPayload(values));
    router.push(`/jobs?created=${id}`);
  });

  return (
    <Stack spacing={3} sx={{ maxWidth: 920, mx: "auto", pt: { xs: 1, md: 3 } }}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5" fontWeight={700}>
            Post New Job
          </Typography>
          <Chip
            size="small"
            color="secondary"
            label="✨ AI-driven screening"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Fill in the details. Min Experience and Required Skills are always enforced as
          hard filters.
        </Typography>
      </Box>

      <Stepper activeStep={active} alternativeLabel>
        {STEPS.map((s) => (
          <Step key={s.label}>
            <StepLabel>{s.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                {STEPS[active].label}
              </Typography>
              <StepComponent />
            </CardContent>
          </Card>

          {createJob.isError && <ErrorAlert error={createJob.error} sx={{ mt: 2 }} />}

          <Stack direction="row" justifyContent="flex-end" spacing={1.5} mt={3}>
            <Button
              type="button"
              color="inherit"
              onClick={() =>
                active === 0 ? router.push("/jobs") : setActive((s) => s - 1)
              }
            >
              {active === 0 ? "Cancel" : "Back"}
            </Button>

            {isLast ? (
              <Button type="submit" variant="contained" disabled={createJob.isPending}>
                {createJob.isPending ? "Creating…" : "Create Job"}
              </Button>
            ) : (
              <Button type="button" variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Stack>
        </Box>
      </FormProvider>
    </Stack>
  );
};

export default NewJobPage;
