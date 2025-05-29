import React from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useWorkspace();
  const { user } = useAuth();

  // Get user initials for the avatar fallback
  const getInitials = () => {
    if (!user) return "A";
    return (user.email?.charAt(0) || "A").toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <MobileNav />
          <div className="font-bold text-xl">{tenant?.name || "Allora OS"}</div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
