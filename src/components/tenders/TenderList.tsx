
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";

type Tender = {
  id: string;
  title: string;
  status: string;
  budget_min: number;
  budget_max: number;
  start_date: string;
  end_date: string;
  created_at: string;
  created_by: string;
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  pending_review: "bg-yellow-500",
  active: "bg-green-500",
  under_evaluation: "bg-blue-500",
  awarded: "bg-purple-500",
  cancelled: "bg-red-500",
  closed: "bg-slate-500",
};

export default function TenderList() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userRole } = useUserRole();
  const isGovernmentUser = userRole === 'government';

  const activateTender = async (tenderId: string) => {
    try {
      const { error } = await supabase
        .from('tenders')
        .update({ status: 'active' })
        .eq('id', tenderId);

      if (error) throw error;

      // Update local state to reflect the change
      setTenders(tenders.map(tender => 
        tender.id === tenderId 
          ? { ...tender, status: 'active' }
          : tender
      ));

      toast({
        title: "Success",
        description: "Tender has been activated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to activate tender",
      });
    }
  };

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        // First get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
          .from("tenders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // If not a government user and not a tender creator, filter out drafts
        if (!isGovernmentUser) {
          query = query.or(`status.neq.draft, and(status.eq.draft,created_by.eq.${user?.id})`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setTenders(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch tenders",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenders();
  }, [toast, isGovernmentUser]);

  const formatBudget = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading tenders...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Budget Range</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenders.map((tender) => (
            <TableRow key={tender.id}>
              <TableCell className="font-medium">{tender.title}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${statusColors[tender.status]} text-white`}
                >
                  {tender.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {formatBudget(tender.budget_min, tender.budget_max)}
              </TableCell>
              <TableCell>
                {formatDistance(new Date(tender.start_date), new Date(tender.end_date), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                {formatDistance(new Date(tender.created_at), new Date(), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tenders/${tender.id}`)}
                >
                  View Details
                </Button>
                {isGovernmentUser && tender.status === 'draft' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => activateTender(tender.id)}
                  >
                    Activate
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {tenders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No tenders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
