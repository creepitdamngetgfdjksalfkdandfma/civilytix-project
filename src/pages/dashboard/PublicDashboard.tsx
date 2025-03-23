
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import TenderList from "@/components/tenders/TenderList";
import { useToast } from "@/hooks/use-toast";

const PublicDashboard = () => {
  const [stats, setStats] = useState({
    totalTenders: 0,
    activeTenders: 0,
    completedTenders: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { count: totalCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true });

        const { count: activeCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        const { count: completedCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true })
          .eq("status", "closed");

        setStats({
          totalTenders: totalCount || 0,
          activeTenders: activeCount || 0,
          completedTenders: completedCount || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch dashboard statistics",
        });
      }
    };

    fetchDashboardStats();
  }, [toast]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Public Tender Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Tenders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalTenders}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Tenders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.activeTenders}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completedTenders}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Tenders</h2>
        <TenderList />
      </div>
    </div>
  );
};

export default PublicDashboard;
