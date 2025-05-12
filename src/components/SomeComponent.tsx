
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LayoutDashboard } from 'lucide-react';

const SomeComponent = () => {
  return (
    <div>
      <User />
      <LayoutDashboard />
      <input
        type="text"
        placeholder="Enter your username"
        className="px-4 py-2 border rounded-md"
      />
    </div>
  );
};

export default SomeComponent;
