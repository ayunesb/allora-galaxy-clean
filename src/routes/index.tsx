
import { RouteObject } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import AuthRoutes from './AuthRoutes';
import OnboardingRoutes from './OnboardingRoutes';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoutes />,
    children: []
  },
  {
    path: '/auth/*',
    element: <AuthRoutes />
  },
  {
    path: '/onboarding',
    element: <OnboardingRoutes />
  },
  {
    path: '*',
    element: <PublicRoutes />
  }
];

export default routes;
