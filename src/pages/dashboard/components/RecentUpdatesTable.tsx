
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { formatDistance } from "date-fns";
import type { ProjectUpdate } from "@/types/project";

interface RecentUpdatesTableProps {
  updates: ProjectUpdate[];
}

export function RecentUpdatesTable({ updates }: RecentUpdatesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {updates.map((update) => (
          <TableRow key={update.id}>
            <TableCell className="font-medium">{update.title}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <Progress value={update.metrics?.completion_percentage || 0} />
                <p className="text-xs text-muted-foreground">
                  {update.metrics?.completion_percentage || 0}% complete
                </p>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistance(new Date(update.created_at), new Date(), {
                addSuffix: true,
              })}
            </TableCell>
          </TableRow>
        ))}
        {updates.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              No recent updates
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
