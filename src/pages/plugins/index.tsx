import React from "react";
import { Link } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  Settings,
  Filter,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const PluginsPage: React.FC = () => {
  const tenantId = useTenantId();

  const { data: plugins, isLoading } = useQuery({
    queryKey: ["plugins", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("plugins")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching plugins:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!tenantId,
  });

  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Plugins</h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor your AI plugin ecosystem
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Plugin
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Plugin Leaderboard</CardTitle>
              <CardDescription>
                Track performance metrics and XP
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-center h-32">
                <Sparkles className="h-16 w-16 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/plugins/leaderboard" className="w-full">
                <Button variant="default" className="w-full">
                  View Leaderboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Plugin Analytics</CardTitle>
              <CardDescription>Execution metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-center h-32">
                <BarChart3 className="h-16 w-16 text-blue-500 opacity-80" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full">
                View Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure plugin defaults</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-center h-32">
                <Settings className="h-16 w-16 text-slate-500 opacity-80" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full">
                Manage Settings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Your Plugins</h2>

        {isLoading ? (
          <div>Loading plugins...</div>
        ) : plugins && plugins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plugins.map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{plugin.name}</CardTitle>
                    <Badge
                      variant={
                        plugin.status === "active" ? "default" : "outline"
                      }
                    >
                      {plugin.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {plugin.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">
                        {plugin.xp || 0} XP
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plugin.category || "Uncategorized"}
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="pt-3 pb-3">
                  <Link to={`/plugins/${plugin.id}`} className="w-full">
                    <Button
                      variant="ghost"
                      className="w-full flex justify-center"
                    >
                      Details <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No plugins found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Create your first plugin to start building your AI intelligence
                ecosystem.
              </p>
              <Button className="mt-6">
                <Plus className="h-4 w-4 mr-2" />
                Create First Plugin
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </RequireAuth>
  );
};

export default PluginsPage;
