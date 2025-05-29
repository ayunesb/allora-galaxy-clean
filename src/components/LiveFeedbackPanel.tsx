import { usePluginFeedbackLive } from "@/hooks/usePluginFeedback";
import { fetchPluginFeedback } from "@/api/pluginFeedback";
import { useEffect, useState } from "react";

const LiveFeedbackPanel = (props) => {
  const [feedback, setFeedback] = useState<PluginFeedback[]>([]);
  const { pluginId } = props;

  usePluginFeedbackLive(pluginId, () => {
    fetchPluginFeedback(pluginId).then(setFeedback);
  });

  return (
    <div>
      {feedback.map((item) => (
        <div key={item.id}>{item.comment}</div>
      ))}
    </div>
  );
};

export default LiveFeedbackPanel;