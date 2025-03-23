
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ProjectMetrics } from "@/types/project";

interface UpdateMetricsProps {
  metrics: ProjectMetrics;
}

export function UpdateMetrics({ metrics }: UpdateMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <p className="text-sm font-medium">Completion</p>
        <Progress value={metrics.completion_percentage} />
        <p className="text-xs text-muted-foreground">
          {metrics.completion_percentage}% complete
        </p>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Budget Utilized</p>
        <p className="text-sm">
          ${metrics.budget_used.toLocaleString()} 
          <span className="text-xs text-muted-foreground"> / ${metrics.total_budget.toLocaleString()}</span>
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Economic Impact</p>
        <Badge variant={
          metrics.economic_impact === 'high' ? 'default' :
          metrics.economic_impact === 'medium' ? 'secondary' : 'outline'
        }>
          {metrics.economic_impact}
        </Badge>
      </div>
    </div>
  );
}
