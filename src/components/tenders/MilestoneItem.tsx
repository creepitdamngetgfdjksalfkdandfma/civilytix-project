
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Milestone } from "@/types/milestone";

interface MilestoneItemProps {
  milestone: Milestone;
}

const statusColors = {
  pending: "bg-yellow-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  delayed: "bg-red-500",
};

export function MilestoneItem({ milestone }: MilestoneItemProps) {
  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{milestone.title}</h3>
        <Badge 
          className={`${statusColors[milestone.status]} text-white`}
        >
          {milestone.status}
        </Badge>
      </div>
      
      {milestone.description && (
        <p className="text-sm text-muted-foreground">{milestone.description}</p>
      )}
      
      <div className="space-y-1">
        <Progress value={milestone.completion_percentage} />
        <p className="text-xs text-muted-foreground">
          {milestone.completion_percentage}% complete
        </p>
      </div>
      
      {milestone.due_date && (
        <p className="text-xs text-muted-foreground">
          Due {formatDistance(new Date(milestone.due_date), new Date(), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
