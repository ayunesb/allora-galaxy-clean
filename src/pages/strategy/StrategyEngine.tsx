import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { runStrategy } from "@/lib/strategy/runStrategy";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const StrategyEngine: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const { notifySuccess, notifyError } = useToast();

  useEffect(() => {
    const fetchStrategy = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("strategies")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setStrategy(data);
      } catch (error: any) {
        console.error("Error fetching strategy:", error);
        notifyError(`Failed to load strategy: ${error.message}`);
      }
    };

    fetchStrategy();
  }, [id, notifyError]);

  const handleRunStrategy = async () => {
    if (!strategy) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const result = await runStrategy({
        strategyId: strategy.id,
        tenantId: strategy.tenant_id,
        userId: user?.id,
      });

      setExecutionResult(result);

      if (result.success) {
        notifySuccess("Strategy executed successfully");
      } else {
        notifyError(result.error || "Failed to execute strategy");
      }
    } catch (error: any) {
      console.error("Error running strategy:", error);
      notifyError(`Failed to run strategy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!strategy) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{strategy.title}</h1>
        <Button onClick={handleRunStrategy} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Run Strategy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strategy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{strategy.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Status</h3>
              <p className="capitalize">{strategy.status}</p>
            </div>
            <div>
              <h3 className="font-medium">Created</h3>
              <p>{new Date(strategy.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {executionResult && (
        <Card
          className={
            executionResult.success ? "border-green-500" : "border-red-500"
          }
        >
          <CardHeader>
            <CardTitle>Execution Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="capitalize">{executionResult.status}</p>
                </div>
                <div>
                  <h3 className="font-medium">Execution Time</h3>
                  <p>
                    {executionResult.execution_time
                      ? `${executionResult.execution_time.toFixed(2)}s`
                      : "N/A"}
                  </p>
                </div>
                {executionResult.plugins_executed && (
                  <>
                    <div>
                      <h3 className="font-medium">Plugins Executed</h3>
                      <p>{executionResult.plugins_executed}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Successful Plugins</h3>
                      <p>
                        {executionResult.successful_plugins} /{" "}
                        {executionResult.plugins_executed}
                      </p>
                    </div>
                  </>
                )}
                {executionResult.xp_earned && (
                  <div>
                    <h3 className="font-medium">XP Earned</h3>
                    <p>{executionResult.xp_earned}</p>
                  </div>
                )}
              </div>

              {executionResult.error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                  <h3 className="font-medium text-red-700 dark:text-red-300">
                    Error
                  </h3>
                  <p className="text-red-600 dark:text-red-400">
                    {executionResult.error}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StrategyEngine;
