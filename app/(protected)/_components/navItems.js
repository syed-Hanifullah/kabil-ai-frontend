import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";

/** Primary nav — the working areas of the HR console. */
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: HomeOutlinedIcon },
  { label: "Jobs", href: "/jobs", icon: BusinessCenterOutlinedIcon },
  { label: "CV Inbox", href: "/cv-inbox", icon: InboxOutlinedIcon },
  { label: "Talent Pool", href: "/talent-pool", icon: GroupsOutlinedIcon },
];

/** Locked, not-yet-built areas (shown disabled under "Coming soon"). */
export const COMING_SOON_ITEMS = [
  { label: "Analytics", icon: InsightsOutlinedIcon },
  { label: "Reference Checks", icon: FactCheckOutlinedIcon },
  { label: "Video Interviews", icon: VideocamOutlinedIcon },
];
