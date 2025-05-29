import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMobileBreakpoint } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Add your navigation items here
const navigationItems = [
  { name: "Dashboard", path: "/" },
  { name: "Strategies", path: "/launch" },
  { name: "Plugins", path: "/plugins" },
  { name: "Galaxy Explorer", path: "/explore" },
  { name: "Agent Performance", path: "/agents/performance" },
  { name: "KPI Dashboard", path: "/insights/kpis" },
];

const adminItems = [
  { name: "AI Decisions", path: "/admin/ai-decisions" },
  { name: "Plugin Logs", path: "/admin/plugin-logs" },
  { name: "System Logs", path: "/admin/system-logs" },
  { name: "User Management", path: "/admin/users" },
];

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useWorkspace();
  const [open, setOpen] = React.useState(false);
  const isMobile = useMobileBreakpoint();

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  if (!isMobile) {
    return (
      <div className="h-14 border-b px-4 flex items-center justify-between">
        <div className="font-semibold">{tenant?.name || "Allora OS"}</div>
        <SidebarTrigger />
      </div>
    );
  }

  return (
    <div className="h-14 border-b px-4 flex items-center justify-between">
      <div className="font-semibold">{tenant?.name || "Allora OS"}</div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="flex justify-between items-center">
              <DrawerTitle>{tenant?.name || "Navigation"}</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerHeader>
            <div className="px-4 py-2">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={
                      location.pathname === item.path ? "secondary" : "ghost"
                    }
                    className={cn(
                      "w-full justify-start",
                      location.pathname === item.path && "bg-secondary",
                    )}
                    onClick={() => handleNavigate(item.path)}
                  >
                    {item.name}
                  </Button>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="pt-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </p>
                <div className="mt-2 space-y-1">
                  {adminItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={
                        location.pathname === item.path ? "secondary" : "ghost"
                      }
                      className={cn(
                        "w-full justify-start",
                        location.pathname === item.path && "bg-secondary",
                      )}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNav;
