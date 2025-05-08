
import { EvolutionDashboard } from '@/components/evolution/EvolutionDashboard';
import { RequireAuth } from '@/components/auth/RequireAuth';

const EvolutionPage = () => {
  return (
    <RequireAuth>
      <EvolutionDashboard />
    </RequireAuth>
  );
};

export default EvolutionPage;
