
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyProjectsStateProps {
  isGovernmentUser: boolean;
}

const EmptyProjectsState = ({ isGovernmentUser }: EmptyProjectsStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 border rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-2">No projects found</h3>
      <p className="text-gray-500 mb-4">
        {isGovernmentUser 
          ? "Create your first project by clicking the 'Create Project' button."
          : "No projects are available at this time."}
      </p>
      {isGovernmentUser && (
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      )}
    </div>
  );
};

export default EmptyProjectsState;
