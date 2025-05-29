import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import { lazyPage } from "@/utils/lazyImport";
import LazyLoadingWrapper from "@/components/LazyLoadingWrapper";

// Lazy-loaded pages with code splitting
const ErrorStateExamplesPage = lazyPage(
  () => import("./ErrorStateExamplesPage"),
);
// If LoadingStatesPage or EdgeErrorHandlingPage do not exist, comment out their imports and usage
// const LoadingStatesPage = lazyPage(() => import("./LoadingStatesPage"));
// const EdgeErrorHandlingPage = lazyPage(() => import("./EdgeErrorHandlingPage"));
const PerformanceExamplesPage = lazyPage(
  () => import("./PerformanceExamplesPage"),
);

export const ExamplesRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="error-states"
          element={
            <LazyLoadingWrapper loadingText="Loading error state examples...">
              <ErrorStateExamplesPage />
            </LazyLoadingWrapper>
          }
        />

        {/* 
        <Route
          path="loading-states"
          element={
            <LazyLoadingWrapper loadingText="Loading state examples...">
              <LoadingStatesPage />
            </LazyLoadingWrapper>
          }
        />

        <Route
          path="edge-errors"
          element={
            <LazyLoadingWrapper loadingText="Loading edge error examples...">
              <EdgeErrorHandlingPage />
            </LazyLoadingWrapper>
          }
        />
        */}

        <Route
          path="performance"
          element={
            <LazyLoadingWrapper loadingText="Loading performance examples...">
              <PerformanceExamplesPage />
            </LazyLoadingWrapper>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/examples/error-states" replace />}
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default ExamplesRouter;
