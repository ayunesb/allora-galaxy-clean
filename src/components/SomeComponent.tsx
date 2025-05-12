import { useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UserIcon, DashboardIcon } from '@radix-ui/react-icons'; // Replace with actual imports
import InputWithIcon from '@/components/ui/InputWithIcon';
// ...existing code...

const SomeComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <UserIcon />
      <DashboardIcon />
      <InputWithIcon
        startAdornment={<UserIcon />}
        placeholder="Enter your username"
      />
    </div>
  );
};