import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-1/2 mb-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-5" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
