// Minimal stub for AlertSettingsCard to resolve import error
import React from "react";

interface AlertSettingsCardProps {
  settings: unknown;
  isLoading: boolean;
}

const AlertSettingsCard: React.FC<AlertSettingsCardProps> = ({ settings, isLoading }) => (
  <div>
    {/* Render alert settings here */}
    {isLoading ? "Loading..." : "Alert Settings"}
  </div>
);

export default AlertSettingsCard;
