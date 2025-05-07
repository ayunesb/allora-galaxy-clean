
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/dashboard/Dashboard';

// This file is no longer used for routing.
// Routes are now defined directly in App.tsx.
// This file is kept for reference or future use.

const RedirectToDashboard = () => <Navigate to="/dashboard" replace />;

export default RedirectToDashboard;
