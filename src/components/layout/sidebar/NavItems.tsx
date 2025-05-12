
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Users,
  Rocket,
  Network,
  ListTodo,
  Clock,
  AlertCircle,
  History
} from "lucide-react";
import { NavigationItem } from "@/types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Launch",
    href: "/launch",
    icon: Rocket,
  },
  {
    title: "Galaxy",
    href: "/galaxy",
    icon: Network,
  },
  {
    title: "Analytics",
    href: "/insights/kpis",
    icon: BarChart3,
  },
];

export const adminNavigationItems: NavigationItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "System Logs",
    href: "/admin/logs",
    icon: History,
  },
  {
    title: "AI Decisions",
    href: "/admin/ai-decisions",
    icon: AlertCircle,
  },
  {
    title: "CRON Jobs",
    href: "/admin/cron-jobs",
    icon: Clock,
  },
  {
    title: "API Keys",
    href: "/admin/api-keys",
    icon: Settings,
  },
];

export const profileNavigationItems: NavigationItem[] = [
  {
    title: "Profile Settings",
    href: "/settings/profile",
    icon: Users,
  },
  {
    title: "Account",
    href: "/settings/account",
    icon: Settings,
  },
];

export const agentNavigationItems: NavigationItem[] = [
  {
    title: "Performance",
    href: "/agents/performance",
    icon: BarChart3,
  },
  {
    title: "Tasks",
    href: "/agents/tasks",
    icon: ListTodo,
  },
];
