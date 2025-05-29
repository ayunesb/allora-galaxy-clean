import { useState, useEffect } from "react";

export interface PluginFeedback {
  id: string;
  pluginId: string;
  comment: string;
  rating: number;
}

export const usePluginFeedback = () => {
  const [feedbackList, setFeedbackList] = useState<PluginFeedback[]>([]);

  useEffect(() => {
    // Simulated fetch - replace with actual fetch logic
    setFeedbackList([
      { id: "1", pluginId: "a", comment: "Great!", rating: 5 },
      { id: "2", pluginId: "b", comment: "Needs improvement", rating: 3 },
    ]);
  }, []);

  return { feedbackList };
};
