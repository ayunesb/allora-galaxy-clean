import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TrendDirection } from "@/types/shared";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  trendDirection?: TrendDirection;
  trendValue?: number | string;
  isPositive?: boolean;
  category?: string;
  footer?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  description,
  trendDirection = "neutral",
  trendValue,
  isPositive = true,
  category,
  footer,
}) => {
  const renderTrendIcon = () => {
    switch (trendDirection) {
      case "up":
        return (
          <TrendingUp
            className={`h-4 w-4 ${isPositive ? "text-green-500" : "text-red-500"}`}
          />
        );
      case "down":
        return (
          <TrendingDown
            className={`h-4 w-4 ${isPositive ? "text-red-500" : "text-green-500"}`}
          />
        );
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {category && (
            <Badge variant="outline" className="text-xs font-normal">
              {category}
            </Badge>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {(trendDirection || trendValue) && (
          <div className="flex items-center mt-1 text-sm">
            {renderTrendIcon()}
            <span
              className={`ml-1 ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {trendValue && `${trendValue}%`}
            </span>
            <span className="text-muted-foreground ml-2">
              vs. previous period
            </span>
          </div>
        )}
      </CardContent>
      {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
    </Card>
  );
};

export default KPICard;
