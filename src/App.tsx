
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";

// Route groups
import AuthRoutes from "./routes/AuthRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import OnboardingRoutes from "./routes/OnboardingRoutes";
import PublicRoutes from "./routes/PublicRoutes";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Root route */}
                  <Route path="/" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />

                  {/* Auth routes */}
                  <Route path="/auth/*" element={<AuthRoutes />} />

                  {/* Onboarding */}
                  <Route path="/onboarding/*" element={
                    <WorkspaceProvider>
                      <OnboardingRoutes />
                    </WorkspaceProvider>
                  } />

                  {/* Protected routes - matched by pattern */}
                  <Route path="/launch/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  <Route path="/plugins/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  <Route path="/explore/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  <Route path="/agents/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  <Route path="/insights/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  <Route path="/settings/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  <Route path="/admin/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  <Route path="/deletion-request/*" element={
                    <WorkspaceProvider>
                      <ProtectedRoutes />
                    </WorkspaceProvider>
                  } />
                  
                  {/* Public routes */}
                  <Route path="/*" element={<PublicRoutes />} />
                </Routes>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
