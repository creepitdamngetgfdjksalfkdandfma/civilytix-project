
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/auth";

import ProjectsHeader from "@/components/projects/ProjectsHeader";
import ProjectsList from "@/components/projects/ProjectsList";
import ProjectsLoading from "@/components/projects/ProjectsLoading";
import EmptyProjectsState from "@/components/projects/EmptyProjectsState";
import AuthCheck from "@/components/projects/AuthCheck";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    isLoading, 
    error, 
    refetch, 
    authLoading, 
    roleLoading, 
    userRole,
    user 
  } = useProjects();
  
  const { checkAuth } = useAuth();
  
  console.log("==================== ProjectsPage ====================");
  console.log("Auth state:", { user: user ? "Logged in" : "Not logged in", userRole, authLoading, roleLoading });
  console.log("User details:", user);
  console.log("======================================================");

  // Ensure auth is checked when the component mounts
  useEffect(() => {
    if (!user && !authLoading) {
      console.log("Checking auth from ProjectsPage");
      checkAuth();
    }
  }, [user, authLoading, checkAuth]);

  useEffect(() => {
    if (!user && !authLoading) {
      console.log("No authenticated user detected on ProjectsPage - redirecting to auth");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="container mx-auto py-8">
        <AuthCheck isLoading={true} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <AuthCheck isLoading={false} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <ProjectsHeader 
        isGovernmentUser={userRole === 'government'} 
        onRefresh={refetch} 
      />

      {error && (
        <div className="p-4 mb-4 border border-red-500 rounded bg-red-50 text-red-700">
          Error loading projects: {error instanceof Error ? error.message : 'Unknown error occurred'}
        </div>
      )}

      {isLoading ? (
        <ProjectsLoading />
      ) : !projects || projects.length === 0 ? (
        <EmptyProjectsState isGovernmentUser={userRole === 'government'} />
      ) : (
        <ProjectsList projects={projects} />
      )}
    </div>
  );
};

export default ProjectsPage;
