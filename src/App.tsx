
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import './App.css';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsProvider } from './context/notifications/NotificationsProvider';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Create router from routes configuration
const router = createBrowserRouter(routes);

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
