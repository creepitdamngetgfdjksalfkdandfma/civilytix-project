
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectStatisticsProps {
  completedProjects: number;
  activeProjects: number;
  averageCompletion: number;
}

export function ProjectStatistics({
  completedProjects,
  activeProjects,
  averageCompletion,
}: ProjectStatisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Project Success Rate</p>
            <p className="text-2xl font-bold">
              {completedProjects > 0
                ? Math.round((completedProjects / (activeProjects + completedProjects)) * 100)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Overall Progress</p>
            <Progress value={averageCompletion} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">
              Average completion across all projects: {averageCompletion}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
