
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, DollarSign, Flag, Trash2 } from "lucide-react";
import type { ProjectUpdateType } from "@/types/project";

interface UpdateHeaderProps {
  title: string;
  updateType: ProjectUpdateType;
  onDelete: () => void;
}

export function UpdateHeader({ title, updateType, onDelete }: UpdateHeaderProps) {
  const getUpdateIcon = (type: ProjectUpdateType) => {
    switch (type) {
      case 'progress':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'economic':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'budget':
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      case 'milestone':
        return <Flag className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getUpdateIcon(updateType)}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{updateType}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
