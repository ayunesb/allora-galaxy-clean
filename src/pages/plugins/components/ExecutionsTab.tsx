import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ArrowUpDown } from "lucide-react";

interface ExecutionsTabProps {
  pluginId: string;
}

interface Execution {
  id: string;
  status: "success" | "error" | "running";
  created_at: string;
  execution_time: number;
  xp_earned: number;
  strategy_id?: string;
}

const ExecutionsTab: React.FC<ExecutionsTabProps> = ({ pluginId }) => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        setLoading(true);

        // Here we would fetch the executions from the API
        // For now, let's mock the data
        const mockExecutions: Execution[] = [
          {
            id: "exec-1",
            status: "success",
            created_at: new Date().toISOString(),
            execution_time: 1.5,
            xp_earned: 10,
            strategy_id: "strategy-1",
          },
          {
            id: "exec-2",
            status: "error",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            execution_time: 0.8,
            xp_earned: 0,
            strategy_id: "strategy-1",
          },
          {
            id: "exec-3",
            status: "success",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            execution_time: 1.2,
            xp_earned: 8,
            strategy_id: "strategy-2",
          },
        ];

        setExecutions(mockExecutions);
      } catch (error) {
        console.error("Error fetching executions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, [pluginId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Error
          </Badge>
        );
      case "running":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            Running
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No executions found for this plugin.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>
              <div className="flex items-center">
                Executed at
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Time (s)</TableHead>
            <TableHead>XP earned</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((execution) => (
            <TableRow key={execution.id}>
              <TableCell>{getStatusBadge(execution.status)}</TableCell>
              <TableCell>{formatDate(execution.created_at)}</TableCell>
              <TableCell>{execution.execution_time.toFixed(2)}</TableCell>
              <TableCell>{execution.xp_earned}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ExecutionsTab;
