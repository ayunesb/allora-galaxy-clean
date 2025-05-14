
import { Routes, Route, useRoutes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import CookieConsent from './components/CookieConsent';
import { Providers } from './providers';
import { routes } from './routes';

function App() {
  const routeElements = useRoutes(routes);
  
  return (
    <Providers>
      {routeElements}
      <Toaster />
      <CookieConsent />
    </Providers>
  );
}

export default App;
