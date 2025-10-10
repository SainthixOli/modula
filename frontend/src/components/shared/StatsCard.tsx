import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  gradient?: string;
}

export const StatsCard = ({ title, value, subtitle, trend, icon: Icon, gradient }: StatsCardProps) => {
  return (
    <Card className={gradient ? `bg-gradient-to-br ${gradient} text-white border-0` : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-sm ${gradient ? "text-white/80" : "text-muted-foreground"}`}>
              {title}
            </p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
          </div>
          {Icon && (
            <div className={`w-12 h-12 rounded-xl ${gradient ? "bg-white/20" : "bg-muted"} flex items-center justify-center`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        {subtitle && (
          <p className={`text-sm ${gradient ? "text-white/80" : "text-muted-foreground"}`}>
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-medium ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className={`text-xs ${gradient ? "text-white/60" : "text-muted-foreground"}`}>
              vs. período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
