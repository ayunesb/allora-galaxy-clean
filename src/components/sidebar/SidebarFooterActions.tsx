import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, Settings, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";

const SidebarFooterActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut?.();
    navigate("/auth/login");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleHelpClick = () => {
    // Open help documentation in a new tab
    window.open("https://docs.alloraos.com", "_blank");
  };

  return (
    <div className="border-t pt-4">
      <div className="flex flex-col gap-2 px-2">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={handleSettingsClick}
        >
          <Settings className="mr-2 h-4 w-4" />
          {t("navigation.settings")}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={handleHelpClick}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          {t("navigation.help")}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("auth.logout")}
        </Button>
      </div>
    </div>
  );
};

export default SidebarFooterActions;
