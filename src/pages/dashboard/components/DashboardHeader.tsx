
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">CivilyTix Dashboard</h2>
      <Badge variant="outline" className="text-sm">
        Public View
      </Badge>
    </div>
  );
}
