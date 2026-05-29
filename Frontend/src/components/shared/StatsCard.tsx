import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

type StatsCardType = {
    title: string;
    value: string;
    icon: any;
    color: string;
    description?: string;
    trend?: "up" | "down";
    trendValue?: number;
}

export const StatCard = ({ title, value, icon: Icon, description, color = "blue", trend, trendValue }: StatsCardType) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500! ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </CardTitle>
        <div
          className={`h-10 w-10 rounded-full bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center`}
        >
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
          {trend && trendValue && (
            <div
              className={`flex items-center gap-1 text-xs ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
