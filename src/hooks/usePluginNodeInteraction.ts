import { useState, useCallback } from "react";

export const usePluginNodeInteraction = () => {
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);

  const handleClick = useCallback((id: string) => {
    setSelectedPluginId(id);
  }, []);

  return {
    selectedPluginId,
    handleClick,
  };
};