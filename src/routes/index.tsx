import React from 'react';
import { Navigate } from 'react-router-dom';

// This file is no longer used for routing.
// Routes are now defined directly in App.tsx and routes.tsx.
// Keeping minimal code for backwards compatibility

const RedirectToDashboard = () => <Navigate to="/dashboard" replace />;

export default RedirectToDashboard;
