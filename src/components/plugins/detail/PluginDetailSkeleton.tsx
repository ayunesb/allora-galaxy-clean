import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export const PluginDetailSkeleton: React.FC = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <Button variant="ghost" onClick={goBack} className="mb-4 group">
        <ChevronLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />{" "}
        Back
      </Button>

      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-64 mb-6" />

      {/* Content skeleton */}
      <Card className="animate-pulse">
        <CardHeader>
          <Skeleton className="h-7 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-7 w-48" />
            </div>

            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-7 w-20" />
            </div>

            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <div className="flex gap-4">
                <div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-16 mt-1" />
                </div>
                <div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-16 mt-1" />
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-full max-w-xs" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default PluginDetailSkeleton;
