import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Adjust import if your client is elsewhere

type PluginFeedback = {
  id: string;
  plugin_id: string;
  message: string;
  sentiment: string;
  // ...other fields as needed...
};

export function usePluginFeedback(pluginId: string) {
  const [feedback, setFeedback] = useState<PluginFeedback[]>([]);

  useEffect(() => {
    const sub = supabase
      .from(`plugin_logs:plugin_id=eq.${pluginId}`)
      .on("INSERT", (payload) => {
        setFeedback((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [pluginId]);

  return feedback;
}

export function usePluginFeedbackLive(pluginId: string, onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel("plugin_feedback_live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plugin_logs",
          filter: `plugin_id=eq.${pluginId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pluginId, onUpdate]);
}
