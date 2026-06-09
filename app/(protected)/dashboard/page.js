"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

const STATS = [
  { label: "Open Jobs", value: "0", icon: BusinessCenterOutlinedIcon },
  { label: "New Applications", value: "0", icon: InboxOutlinedIcon },
  { label: "In Review", value: "0", icon: HourglassEmptyOutlinedIcon },
  { label: "Talent Pool", value: "0", icon: GroupsOutlinedIcon },
];

const DashboardPage = () => (
  <Stack spacing={3}>
    <Typography variant="h5" fontWeight={700}>
      Overview
    </Typography>

    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
      }}
    >
      {STATS.map(({ label, value, icon: Icon }) => (
        <Card key={label} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(19,64,45,0.08)",
                  color: "primary.main",
                }}
              >
                <Icon />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>

    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent activity
        </Typography>
        <Typography color="text.secondary">
          Activity from your jobs and applications will appear here.
        </Typography>
      </CardContent>
    </Card>
  </Stack>
);

export default DashboardPage;
