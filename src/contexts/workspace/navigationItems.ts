
import { NavigationItem } from "@/types/shared";

export const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: "Bell",
  },
  {
    name: "Galaxy",
    href: "/galaxy",
    icon: "Globe",
  },
  {
    name: "Launch",
    href: "/launch",
    icon: "Rocket",
  },
  {
    name: "Plugins",
    href: "/plugins",
    icon: "Package",
  },
  {
    name: "Agents",
    href: "/agents",
    icon: "Users",
    children: [
      {
        name: "Performance",
        href: "/agents/performance",
      },
    ],
  },
  {
    name: "Insights",
    href: "/insights",
    icon: "BarChart",
    children: [
      {
        name: "KPIs",
        href: "/insights/kpis",
      },
    ],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "Settings",
  },
  {
    name: "Admin",
    href: "/admin",
    icon: "Layers",
    adminOnly: true,
    children: [
      {
        name: "Dashboard",
        href: "/admin",
      },
      {
        name: "Users",
        href: "/admin/users",
      },
      {
        name: "System Logs",
        href: "/admin/logs",
      },
      {
        name: "AI Decisions",
        href: "/admin/ai-decisions",
      },
      {
        name: "Plugin Logs",
        href: "/admin/plugin-logs",
      },
      {
        name: "API Keys",
        href: "/admin/api-keys",
      },
    ],
  },
];
