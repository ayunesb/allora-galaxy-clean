
import {
  BarChart2,
  Globe,
  Home,
  LayoutDashboard,
  Settings,
  PackageOpen,
  Code,
  Users,
  Bell,
  Database,
  Bot,
} from "lucide-react";
import { NavigationItem } from "@/types/shared";

export const getNavigationItems = (isAdmin: boolean = false): NavigationItem[] => {
  const baseNavigation: NavigationItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "strategies",
      title: "Strategies",
      href: "/strategies",
      icon: BarChart2,
    },
    {
      id: "plugins",
      title: "Plugins",
      href: "/plugins",
      icon: PackageOpen,
    },
    {
      id: "agents",
      title: "Agents",
      href: "/agents",
      icon: Bot,
    },
    {
      id: "galaxy",
      title: "Galaxy Explorer",
      href: "/galaxy",
      icon: Globe,
      isNew: true,
    }
  ];

  const adminNavigation: NavigationItem[] = [
    {
      id: "admin",
      title: "Admin",
      href: "/admin",
      icon: Settings,
      adminOnly: true,
      items: [
        {
          id: "team",
          title: "Team Management",
          href: "/admin/team",
          icon: Users,
        },
        {
          id: "logs",
          title: "System Logs",
          href: "/admin/logs",
          icon: Database,
        },
        {
          id: "notifications",
          title: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
        },
        {
          id: "developer",
          title: "Developer Tools",
          href: "/admin/developer",
          icon: Code,
        }
      ]
    }
  ];

  return isAdmin ? [...baseNavigation, ...adminNavigation] : baseNavigation;
};
