
import React from 'react';
import CookieConsentDialog from './cookie/CookieConsentDialog';
import { useAuth } from '@/context/AuthContext';

const CookieConsent: React.FC = () => {
  const { user } = useAuth();
  
  // Only show cookie consent dialog to logged-in users
  if (!user) {
    return null;
  }
  
  return <CookieConsentDialog />;
};

export default CookieConsent;
