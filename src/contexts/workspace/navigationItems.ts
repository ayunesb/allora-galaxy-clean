
import { NavigationItem } from "@/types/shared";
import * as LucideIcons from "lucide-react";

// Type-safe function to get Lucide icon component
const getIcon = (iconName: string) => {
  return (LucideIcons as any)[iconName] || undefined;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: getIcon("LayoutDashboard"),
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: getIcon("Bell"),
  },
  {
    title: "Galaxy",
    href: "/galaxy",
    icon: getIcon("Globe"),
  },
  {
    title: "Launch",
    href: "/launch",
    icon: getIcon("Rocket"),
  },
  {
    title: "Plugins",
    href: "/plugins",
    icon: getIcon("Package"),
  },
  {
    title: "Agents",
    href: "/agents",
    icon: getIcon("Users"),
    items: [
      {
        title: "Performance",
        href: "/agents/performance",
      },
    ],
  },
  {
    title: "Insights",
    href: "/insights",
    icon: getIcon("BarChart"),
    items: [
      {
        title: "KPIs",
        href: "/insights/kpis",
      },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: getIcon("Settings"),
  },
  {
    title: "Admin",
    href: "/admin",
    icon: getIcon("Layers"),
    adminOnly: true,
    items: [
      {
        title: "Dashboard",
        href: "/admin",
      },
      {
        title: "Users",
        href: "/admin/users",
      },
      {
        title: "System Logs",
        href: "/admin/logs",
      },
      {
        title: "AI Decisions",
        href: "/admin/ai-decisions",
      },
      {
        title: "Plugin Logs",
        href: "/admin/plugin-logs",
      },
      {
        title: "API Keys",
        href: "/admin/api-keys",
      },
    ],
  },
];
