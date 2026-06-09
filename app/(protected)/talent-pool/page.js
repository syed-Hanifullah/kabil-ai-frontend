"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import EmptyState from "@/components/EmptyState";

const TalentPoolPage = () => (
  <Stack spacing={2.5}>
    <Typography variant="h5" fontWeight={700}>
      Talent Pool
    </Typography>
    <Card sx={{ borderRadius: 2 }}>
      <EmptyState
        emoji="🧑‍💼"
        title="No candidates yet"
        description="Candidates you shortlist across jobs will be collected here."
      />
    </Card>
  </Stack>
);

export default TalentPoolPage;
