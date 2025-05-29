import {
  BarChart3,
  LayoutDashboard,
  Rocket,
  Network,
  ChevronRight,
  Settings,
  Users,
  History,
  AlertCircle,
  Clock,
  Key,
} from "lucide-react";
import { NavigationItem } from "@/types/navigation";

export const mainNavigationItems: NavigationItem[] = [
  {
    name: "Dashboard", // For backward compatibility
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Launch",
    title: "Launch",
    href: "/launch",
    icon: Rocket,
  },
  {
    name: "Galaxy",
    title: "Galaxy",
    href: "/galaxy",
    icon: Network,
  },
  {
    name: "Analytics",
    title: "Analytics",
    href: "/insights/kpis",
    icon: BarChart3,
  },
  {
    name: "Evolution",
    title: "Evolution",
    href: "/evolution",
    icon: ChevronRight,
  },
  {
    name: "Settings",
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const adminNavigationItems: NavigationItem[] = [
  {
    name: "Admin Dashboard",
    title: "Admin Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "System Logs",
    title: "System Logs",
    href: "/admin/system-logs",
    icon: History,
  },
  {
    name: "AI Decisions",
    title: "AI Decisions",
    href: "/admin/ai-decisions",
    icon: AlertCircle,
  },
  {
    name: "CRON Jobs",
    title: "CRON Jobs",
    href: "/admin/cron-jobs",
    icon: Clock,
  },
  {
    name: "API Keys",
    title: "API Keys",
    href: "/admin/api-keys",
    icon: Key,
  },
];
