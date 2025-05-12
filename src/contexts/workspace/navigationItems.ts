
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
        icon: getIcon("LineChart"),
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
        icon: getIcon("TrendingUp"),
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
        icon: getIcon("Home"),
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: getIcon("Users"),
      },
      {
        title: "System Logs",
        href: "/admin/logs",
        icon: getIcon("FileText"),
      },
      {
        title: "AI Decisions",
        href: "/admin/ai-decisions",
        icon: getIcon("Brain"),
      },
      {
        title: "Plugin Logs",
        href: "/admin/plugin-logs",
        icon: getIcon("Database"),
      },
      {
        title: "API Keys",
        href: "/admin/api-keys",
        icon: getIcon("Key"),
      },
    ],
  },
];
