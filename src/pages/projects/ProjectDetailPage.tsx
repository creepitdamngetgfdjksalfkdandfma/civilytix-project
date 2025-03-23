import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, FileText, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Project } from "@/types/project";
import { useState } from "react";
import { ProjectTreeSelector } from "@/components/projects/ProjectTreeSelector";
import { ProjectTreeSelection } from "@/types/projectTree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedNode, setSelectedNode] = useState<ProjectTreeSelection | null>(null);
  const { userRole } = useAuth();

  const isGovernmentUser = userRole === "government";

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data as Project;
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load project: ${error.message}`,
        });
        throw error;
      }
    },
    enabled: !!id,
  });

  const { data: tenders, isLoading: tendersLoading } = useQuery({
    queryKey: ["project-tenders", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tenders")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error fetching tenders:", error);
        return [];
      }
    },
    enabled: !!id,
  });

  const { data: auditReports, isLoading: auditsLoading } = useQuery({
    queryKey: ["project-audits", id],
    queryFn: async () => {
      try {
        const { data: projectTenders } = await supabase
          .from("tenders")
          .select("id")
          .eq("project_id", id);
        
        if (!projectTenders || projectTenders.length === 0) return [];
        
        const tenderIds = projectTenders.map(t => t.id);
        
        const { data, error } = await supabase
          .from("infrastructure_audits")
          .select(`
            *,
            tender:tenders(title)
          `)
          .in("tender_id", tenderIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error fetching audit reports:", error);
        return [];
      }
    },
    enabled: !!id,
  });

  const getStatusColor = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTestResultColor = (result: string | null | undefined) => {
    switch (result?.toLowerCase()) {
      case "passed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateTender = () => {
    if (selectedNode) {
      navigate(`/tenders/new?projectId=${id}&nodeId=${selectedNode.nodeId}&price=${selectedNode.totalPrice}&nodeName=${encodeURIComponent(selectedNode.nodeName)}`);
    } else {
      navigate(`/tenders/new?projectId=${id}`);
    }
  };

  const handleCreateAudit = () => {
    navigate(`/audit/new?projectId=${id}`);
  };

  const handleNodeSelect = (selection: ProjectTreeSelection) => {
    setSelectedNode(selection);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <div className="border border-red-300 bg-red-50 p-4 rounded-md">
          <h2 className="text-red-800 font-medium">Error Loading Project</h2>
          <p className="text-red-600">
            {error instanceof Error
              ? error.message
              : "Project could not be found"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/projects")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <Badge className={`ml-4 ${getStatusColor(project.status)}`}>
          {project.status || "Not specified"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Description</h3>
              <p className="mt-1">
                {project.description || "No description provided"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-medium text-gray-700">Department</h3>
                <p className="mt-1">{project.department || "Not specified"}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Budget Allocated</h3>
                <p className="mt-1">
                  {project.budget_allocated
                    ? `$${project.budget_allocated.toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Start Date</h3>
                <p className="mt-1">
                  {project.start_date
                    ? format(new Date(project.start_date), "MMM d, yyyy")
                    : "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">End Date</h3>
                <p className="mt-1">
                  {project.end_date
                    ? format(new Date(project.end_date), "MMM d, yyyy")
                    : "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Created</h3>
                <p className="mt-1">
                  {format(new Date(project.created_at), "MMM d, yyyy")}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Project Type ID</h3>
                <p className="mt-1">
                  {project.project_type_id || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isGovernmentUser && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleCreateTender}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Tender
                {selectedNode && ` (${selectedNode.totalPrice.toLocaleString()})`}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleCreateAudit}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Create Audit Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Components</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {isGovernmentUser 
                ? "Select a component from the project tree to create a tender specifically for that part."
                : "View the components of this project."
              }
            </p>
            <ProjectTreeSelector 
              onSelect={handleNodeSelect} 
              initialSelectedId={project.project_type_id || undefined}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="tenders">
          <TabsList className="mb-4">
            <TabsTrigger value="tenders">Tenders</TabsTrigger>
            <TabsTrigger value="audits">Audit Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tenders">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tenders</h2>
              
              {isGovernmentUser && (
                <Button onClick={handleCreateTender}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tender
                  {selectedNode && ` (${selectedNode.totalPrice.toLocaleString()})`}
                </Button>
              )}
            </div>

            {tendersLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : tenders && tenders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tenders.map((tender) => (
                  <Card
                    key={tender.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/tenders/${tender.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg truncate">
                          {tender.title}
                        </CardTitle>
                        <Badge
                          className={`${
                            tender.status === "active"
                              ? "bg-green-100 text-green-800"
                              : tender.status === "awarded"
                              ? "bg-blue-100 text-blue-800"
                              : tender.status === "under_evaluation"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tender.status?.replace("_", " ") || "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {tender.description || "No description provided"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 block">Budget:</span>
                          <span>${tender.budget_min.toLocaleString()} - ${tender.budget_max.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Deadline:</span>
                          <span>{format(new Date(tender.end_date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tenders yet</h3>
                <p className="text-gray-500 mb-4">
                  This project doesn't have any tenders yet.
                </p>
                {isGovernmentUser && (
                  <Button onClick={handleCreateTender}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Tender
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="audits">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Audit Reports</h2>
              
              {isGovernmentUser && (
                <Button onClick={handleCreateAudit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Audit Report
                </Button>
              )}
            </div>
            
            {auditsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : auditReports && auditReports.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {auditReports.map((audit) => (
                  <Card
                    key={audit.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/audit/${audit.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg truncate">
                          {audit.test_type}
                        </CardTitle>
                        <Badge className={getTestResultColor(audit.result)}>
                          {audit.result || "Unknown"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {audit.test_description || "No description provided"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 block">Test Date:</span>
                          <span>{format(new Date(audit.test_date), "MMM d, yyyy")}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Tender:</span>
                          <span className="truncate">{audit.tender?.title || "None"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 block">Maintenance:</span>
                          <span>{audit.maintenance_needed ? "Required" : "Not required"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <ClipboardCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No audit reports yet</h3>
                <p className="text-gray-500 mb-4">
                  This project doesn't have any audit reports yet.
                </p>
                {isGovernmentUser && (
                  <Button onClick={handleCreateAudit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Audit Report
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
