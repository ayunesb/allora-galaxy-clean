import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export const StrategyCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="pb-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter className="pt-4 flex justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  );
};
