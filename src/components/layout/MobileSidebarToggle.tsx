import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export interface MobileSidebarToggleProps {
  onClick: () => void;
}

const MobileSidebarToggle: React.FC<MobileSidebarToggleProps> = ({
  onClick,
}) => {
  return (
    <Button variant="ghost" size="sm" className="md:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
};

export default MobileSidebarToggle;
