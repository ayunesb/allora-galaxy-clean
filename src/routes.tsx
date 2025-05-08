
import { RouteObject } from 'react-router-dom';
import PublicRoutes from './routes/PublicRoutes';
import ProtectedRoutes from './routes/ProtectedRoutes';
import AuthRoutes from './routes/AuthRoutes';
import OnboardingRoutes from './routes/OnboardingRoutes';

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
