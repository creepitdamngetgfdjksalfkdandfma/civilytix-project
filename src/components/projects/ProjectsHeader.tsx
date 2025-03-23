
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface ProjectsHeaderProps {
  isGovernmentUser: boolean;
  onRefresh: () => void;
}

const ProjectsHeader = ({ isGovernmentUser, onRefresh }: ProjectsHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    onRefresh();
    toast({
      description: "Refreshing projects...",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        {isGovernmentUser && (
          <Button onClick={() => navigate('/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Projects
        </Button>
      </div>
    </>
  );
};

export default ProjectsHeader;
