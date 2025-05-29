import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import Dashboard from "@/pages/Dashboard";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/auth/LoginPage";
import MainLayout from "@/layouts/MainLayout";
import RequireAuth from "@/components/auth/RequireAuth";

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
