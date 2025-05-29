import React from "react";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex">
      <Outlet />
    </div>
  );
}
