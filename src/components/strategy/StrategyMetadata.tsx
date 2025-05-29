import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

export interface StrategyMetadataProps {
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string | null;
}

const StrategyMetadata: React.FC<StrategyMetadataProps> = ({
  created_at,
  updated_at,
  created_by,
  approved_by,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          {created_at && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Created
              </p>
              <p className="text-sm">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </p>
            </div>
          )}

          {updated_at && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm">
                {formatDistanceToNow(new Date(updated_at), { addSuffix: true })}
              </p>
            </div>
          )}

          {created_by && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Created By
              </p>
              <p className="text-sm">{created_by}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Approved By
            </p>
            <p className="text-sm">{approved_by || "Pending"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyMetadata;
