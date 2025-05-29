import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const SidebarProfile: React.FC = () => {
  const { currentTenant, userRole } = useWorkspace();

  if (!currentTenant) return null;

  // Create initials from the tenant name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(currentTenant.name);

  return (
    <div className="border-t pt-4 pb-2 px-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={undefined} alt={currentTenant.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentTenant.name}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {userRole}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;
