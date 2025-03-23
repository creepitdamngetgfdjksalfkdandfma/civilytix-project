
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TenderStatus } from "@/types/tender";
import { BidderStats } from "./components/BidderStats";
import { WonProjectsList } from "./components/WonProjectsList";

interface WonTender {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  current_status: TenderStatus;
}

const BidderDashboard = () => {
  const [myBids, setMyBids] = useState(0);
  const [availableTenders, setAvailableTenders] = useState(0);
  const [wonProjects, setWonProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [wonTenders, setWonTenders] = useState<WonTender[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id;

        // Fetch user's bids
        const { count: bidsCount } = await supabase
          .from("bids")
          .select("*", { count: "exact", head: true })
          .eq("bidder_id", userId);

        // Fetch available tenders
        const { count: tendersCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // Fetch won projects count
        const { count: wonCount } = await supabase
          .from("bids")
          .select("*", { count: "exact", head: true })
          .eq("bidder_id", userId)
          .eq("status", "selected");

        // Fetch completed projects count
        const { count: completedCount } = await supabase
          .from("tenders")
          .select("*", { count: "exact", head: true })
          .eq("status", "closed")
          .in("id", (
            await supabase
              .from("bids")
              .select("tender_id")
              .eq("bidder_id", userId)
              .eq("status", "selected")
          ).data?.map(bid => bid.tender_id) || []);

        // Fetch won tenders details
        const { data: rawTendersData, error: wonTendersError } = await supabase
          .from("tenders")
          .select(`
            id,
            title,
            status,
            start_date,
            end_date,
            current_status
          `)
          .in("status", ["awarded", "closed"])
          .in("id", (
            await supabase
              .from("bids")
              .select("tender_id")
              .eq("bidder_id", userId)
              .eq("status", "selected")
          ).data?.map(bid => bid.tender_id) || []);

        if (wonTendersError) {
          throw wonTendersError;
        }

        // Transform the raw data to match the WonTender interface
        const transformedTenders: WonTender[] = (rawTendersData || []).map((tender) => ({
          id: tender.id,
          title: tender.title,
          status: tender.status,
          start_date: tender.start_date,
          end_date: tender.end_date,
          current_status: tender.current_status as TenderStatus || {
            completion_percentage: 0,
            budget_utilized: 0,
            last_updated: new Date().toISOString()
          }
        }));

        setMyBids(bidsCount || 0);
        setAvailableTenders(tendersCount || 0);
        setWonProjects(wonCount || 0);
        setCompletedProjects(completedCount || 0);
        setWonTenders(transformedTenders);

        console.log('Won tenders with status:', transformedTenders);
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
        <h2 className="text-3xl font-bold tracking-tight">Bidder Dashboard</h2>
        <Button onClick={() => navigate("/tenders/browse")}>
          <Search className="h-4 w-4 mr-2" />
          Browse Tenders
        </Button>
      </div>

      <BidderStats
        myBids={myBids}
        availableTenders={availableTenders}
        wonProjects={wonProjects}
        completedProjects={completedProjects}
      />
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">My Projects</h3>
        <WonProjectsList wonTenders={wonTenders} />
      </div>
    </div>
  );
};

export default BidderDashboard;
