
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, CheckCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TenderList from "@/components/tenders/TenderList";

const GovernmentDashboard = () => {
  const [stats, setStats] = useState({
    activeTenders: 0,
    pendingReviews: 0,
    totalProjects: 0,
    completedProjects: 0,
    avgCompletionRate: 0
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { count: activeCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        const { count: pendingCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_review");

        const { count: totalCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true });
          
        const { count: completedCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true })
          .eq("status", "closed");

        // Get average completion rate from current_status
        const { data: tendersData } = await supabase
          .from("tenders")
          .select('current_status');
          
        const avgCompletion = tendersData?.reduce((acc, tender) => {
          const status = tender.current_status as { completion_percentage?: number };
          return acc + (status?.completion_percentage || 0);
        }, 0) / (tendersData?.length || 1);

        setStats({
          activeTenders: activeCount || 0,
          pendingReviews: pendingCount || 0,
          totalProjects: totalCount || 0,
          completedProjects: completedCount || 0,
          avgCompletionRate: Math.round(avgCompletion || 0)
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch dashboard data",
        });
      }
    };

    fetchDashboardData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Government Dashboard</h2>
        <Button onClick={() => navigate("/tenders/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tender
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Active Tenders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.activeTenders}</p>
            <p className="text-sm text-gray-500">Currently open for bidding</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-yellow-500" />
              <span>Pending Reviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingReviews}</p>
            <p className="text-sm text-gray-500">Awaiting evaluation</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <span>Completed Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completedProjects}</p>
            <p className="text-sm text-gray-500">Successfully finished</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <span>Average Completion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgCompletionRate}%</p>
            <p className="text-sm text-gray-500">Across all projects</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Tenders</h3>
        <TenderList />
      </div>
    </div>
  );
};

export default GovernmentDashboard;
