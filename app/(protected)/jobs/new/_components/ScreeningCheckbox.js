"use client";

import { Controller, useFormContext } from "react-hook-form";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

/**
 * "Ask on WhatsApp" toggle that sits in a field's label row. Bound to
 * `screening.<name>` in the wizard form; checking it attaches that field's
 * hardcoded screening question to the job. `disabled` renders it locked
 * (used for the always-asked Min Experience hard filter).
 */
const ScreeningCheckbox = ({ name, disabled = false }) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={`screening.${name}`}
      render={({ field }) => (
        <Tooltip
          arrow
          title={
            disabled
              ? "Always asked on WhatsApp (hard filter)"
              : "Ask candidates about this on WhatsApp"
          }
        >
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Checkbox
                size="small"
                sx={{ p: 0.25, mr: 0.5 }}
                checked={!!field.value}
                disabled={disabled}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                Ask on WhatsApp
              </Typography>
            }
          />
        </Tooltip>
      )}
    />
  );
};

export default ScreeningCheckbox;
