
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import TenderList from "@/components/tenders/TenderList";
import { useToast } from "@/hooks/use-toast";

const BrowseTendersPage = () => {
  const [stats, setStats] = useState({
    totalTenders: 0,
    activeTenders: 0,
    completedTenders: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
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
        console.error("Error fetching tender stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch tender statistics",
        });
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Browse Tenders</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle>Completed Tenders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completedTenders}</p>
          </CardContent>
        </Card>
      </div>

      <TenderList />
    </div>
  );
};

export default BrowseTendersPage;

