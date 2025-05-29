import { RequireAuth } from "@/components/auth/RequireAuth";
import EvolutionDashboard from "@/components/evolution/EvolutionDashboard";

const EvolutionPage = () => {
  return (
    <RequireAuth>
      <EvolutionDashboard />
    </RequireAuth>
  );
};

export default EvolutionPage;
