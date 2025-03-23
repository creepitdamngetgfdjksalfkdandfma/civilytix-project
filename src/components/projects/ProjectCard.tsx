
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <Badge className={getStatusColor(project.status)}>
            {project.status || 'Not specified'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-500 line-clamp-2">
            {project.description || 'No description provided'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 block">Department:</span>
              <span>{project.department || 'Not specified'}</span>
            </div>
            {project.budget_allocated && (
              <div>
                <span className="text-gray-500 block">Budget:</span>
                <span>${project.budget_allocated.toLocaleString()}</span>
              </div>
            )}
            {project.start_date && (
              <div>
                <span className="text-gray-500 block">Start Date:</span>
                <span>{format(new Date(project.start_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {project.end_date && (
              <div>
                <span className="text-gray-500 block">End Date:</span>
                <span>{format(new Date(project.end_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-gray-500 block">Created:</span>
              <span>{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
