import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ActivitySquare,
  AlertTriangle,
  BookText,
  Box,
  BrainCircuit,
  FileKey,
  Home,
  NotebookTabs,
  Settings,
  TimerReset,
  Users,
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isAdmin = userRole === "admin" || userRole === "owner";

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Allora OS</h2>
      </div>

      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          <li>
            <Link
              to="/"
              className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                isActive("/") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </li>

          <li>
            <Link
              to="/strategies"
              className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                isActive("/strategies")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
            >
              <NotebookTabs className="h-4 w-4" />
              <span>Strategies</span>
            </Link>
          </li>

          <li>
            <Link
              to="/plugins"
              className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                isActive("/plugins") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <Box className="h-4 w-4" />
              <span>Plugins</span>
            </Link>
          </li>

          <li>
            <Link
              to="/agents"
              className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                isActive("/agents") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <BrainCircuit className="h-4 w-4" />
              <span>Agents</span>
            </Link>
          </li>

          <li>
            <Link
              to="/evolution"
              className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                isActive("/evolution") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <ActivitySquare className="h-4 w-4" />
              <span>Evolution</span>
            </Link>
          </li>
        </ul>

        {isAdmin && (
          <>
            <div className="my-4 px-3">
              <h3 className="text-xs font-medium text-muted-foreground">
                Admin
              </h3>
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                    isActive("/admin") && location.pathname === "/admin"
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/logs"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                    isActive("/admin/logs")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <BookText className="h-4 w-4" />
                  <span>System Logs</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/error-monitoring"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                    isActive("/admin/error-monitoring")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Error Monitoring</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/api-keys"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                    isActive("/admin/api-keys")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <FileKey className="h-4 w-4" />
                  <span>API Keys</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/cron-jobs"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                    isActive("/admin/cron-jobs")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <TimerReset className="h-4 w-4" />
                  <span>Cron Jobs</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/users"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                    isActive("/admin/users")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>

      <div className="p-4 border-t">
        <Link
          to="/settings"
          className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
            isActive("/settings") ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
