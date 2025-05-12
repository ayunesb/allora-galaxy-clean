
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRoutes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { routes } from './routes';

export function App() {
  const routeElement = useRoutes(routes);
  
  return (
    <>
      <Toaster position="top-right" richColors />
      {routeElement}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

// Add this so main.tsx can import default
export default App;
