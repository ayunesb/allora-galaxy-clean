import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PluginDetailPage: React.FC = () => {
  const { id } = useParams();
  const [plugin, setPlugin] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPluginDetails() {
      if (!id) return;
      // If your plugin id is a string like "impact", but your DB uses a UUID or numeric id,
      // you may want to look up by a different column (e.g., slug or name).
      try {
        // Example: lookup by slug if that's your route param
        // const { data, error } = await supabase
        //   .from("plugins")
        //   .select("*")
        //   .eq("slug", id)
        //   .maybeSingle();

        // Default: lookup by id (if id is a UUID or numeric)
        const { data, error } = await supabase
          .from("plugins")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        setPlugin(data);
      } catch (err) {
        setError(
          (err as { message?: string }).message ||
            "Error fetching plugin details"
        );
      }
    }
    fetchPluginDetails();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!plugin) {
    return <div>Loading plugin details...</div>;
  }

  return (
    <div>
      <h1>Plugin Detail Page for ID: {id}</h1>
      <pre>{JSON.stringify(plugin, null, 2)}</pre>
    </div>
  );
};

export default PluginDetailPage;
