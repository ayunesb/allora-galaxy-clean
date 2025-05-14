
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './App.css';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsProvider } from './context/notifications/NotificationsProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <WorkspaceProvider>
            <NotificationsProvider>
              <RouterProvider router={router} />
              <Toaster />
            </NotificationsProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
