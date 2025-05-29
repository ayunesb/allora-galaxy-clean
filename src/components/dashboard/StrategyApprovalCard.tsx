import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

interface Strategy {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
  due_date?: string;
  created_at: string;
  priority?: "low" | "medium" | "high";
}

interface StrategyApprovalCardProps {
  strategy: Strategy;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const StrategyApprovalCard: React.FC<StrategyApprovalCardProps> = ({
  strategy,
  onApprove,
  onReject,
}) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No due date";

    try {
      // Use parseISO to safely parse the date string
      const date = parseISO(dateStr);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Invalid date";
    }
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {strategy.title}
          </CardTitle>
          <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
            <span>Created {formatDate(strategy.created_at)}</span>
          </div>
        </div>
        {strategy.priority && (
          <Badge
            className={getPriorityColor(strategy.priority)}
            variant="outline"
          >
            {strategy.priority}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {strategy.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>
            {strategy.due_date
              ? `Due ${formatDate(strategy.due_date)}`
              : "No deadline"}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(strategy.id)}
            className="flex items-center"
          >
            <XCircle className="mr-1 h-4 w-4" />
            <span>Reject</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onApprove(strategy.id)}
            className="flex items-center"
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            <span>Approve</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StrategyApprovalCard;
