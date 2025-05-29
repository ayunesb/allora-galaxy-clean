import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";

interface Plugin {
  id: string;
  name: string;
  category: string;
  xp: number;
  roi: number;
  status: string;
}

const PluginLeaderboard = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const tenantId = useTenantId();

  useEffect(() => {
    async function fetchPlugins() {
      if (!tenantId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("plugins")
          .select("*")
          .eq("tenant_id", tenantId)
          .order("xp", { ascending: false })
          .limit(10);

        if (error) throw error;
        setPlugins(data || []);
      } catch (error) {
        console.error("Error fetching plugins:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlugins();
  }, [tenantId]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Plugin Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {plugins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No plugins available to display.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plugins.map((plugin, index) => (
                  <TableRow key={plugin.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{plugin.name}</TableCell>
                    <TableCell>{plugin.category || "Uncategorized"}</TableCell>
                    <TableCell className="text-right">
                      {plugin.xp.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{plugin.roi}%</TableCell>
                    <TableCell>{getStatusBadge(plugin.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginLeaderboard;
