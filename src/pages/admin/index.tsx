import React from "react";
import { Link } from "react-router-dom";

export default function AdminPage() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <ul className="space-y-2">
        <li>
          <Link className="underline" to="/admin/SystemLogs">
            System Logs
          </Link>
        </li>
        <li>
          <Link className="underline" to="/admin/PluginLogs">
            Plugin Logs
          </Link>
        </li>
        <li>
          <Link className="underline" to="/admin/AiDecisions">
            AI Decisions
          </Link>
        </li>
      </ul>
    </div>
  );
}
