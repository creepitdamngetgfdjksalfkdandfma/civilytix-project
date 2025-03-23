
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  parseEvaluationCriteria, 
  parseBidSpecifications, 
  parseCriteriaScores,
  parseCriteriaResponses,
  parseRequiredSpecifications 
} from "@/utils/tenderUtils";

interface BidEvaluation {
  id: string;
  criteria_scores: Record<string, number>;
  comments: string | null;
  total_score: number | null;
}

interface Bid {
  id: string;
  amount: number;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'selected' | 'rejected';
  submitted_at: string;
  specifications: Record<string, any>;
  criteria_responses: Record<string, { score: number; justification: string }>;
  bidder_id: string;
  bid_evaluations: BidEvaluation[];
  profiles: {
    full_name: string | null;
    organization: string | null;
  };
}

interface TenderResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  evaluation_criteria: any;
  required_specifications: any;
  bids: Bid[];
  tender_categories: {
    name: string;
  } | null;
}

export const useTenderDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tender, isLoading, error } = useQuery<TenderResponse | null>({
    queryKey: ["tender", id],
    enabled: !!id && id.length > 0,
    queryFn: async () => {
      console.log("Fetching tender with ID:", id);
      
      if (!id) {
        console.log("No tender ID provided");
        return null;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("No active session found");
          throw new Error("Authentication required");
        }

        const { data, error } = await supabase
          .from("tenders")
          .select(`
            *,
            tender_categories (
              name
            ),
            bids!bids_tender_id_fkey (
              id,
              amount,
              status,
              submitted_at,
              specifications,
              criteria_responses,
              bidder_id,
              bid_evaluations (
                id,
                criteria_scores,
                comments,
                total_score
              ),
              profiles:bidder_id (
                full_name,
                organization
              )
            )
          `)
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!data) {
          console.log("No tender found with ID:", id);
          return null;
        }

        console.log("Raw tender data:", data);

        // Safety check for null/undefined values before parsing
        const parsedBids = (data.bids || []).map(bid => ({
          ...bid,
          specifications: bid.specifications ? parseBidSpecifications(bid.specifications) : {},
          criteria_responses: bid.criteria_responses ? parseCriteriaResponses(bid.criteria_responses) : {},
          bid_evaluations: (bid.bid_evaluations || []).map(evaluation => ({
            ...evaluation,
            criteria_scores: evaluation.criteria_scores ? parseCriteriaScores(evaluation.criteria_scores) : {}
          }))
        }));

        const parsedData = {
          ...data,
          bids: parsedBids,
          evaluation_criteria: data.evaluation_criteria ? parseEvaluationCriteria(data.evaluation_criteria) : [],
          required_specifications: data.required_specifications ? parseRequiredSpecifications(data.required_specifications) : []
        };

        console.log("Parsed tender data:", parsedData);
        return parsedData;
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        if (error.message === "Authentication required") {
          navigate('/auth');
        }
        throw error;
      }
    },
    retry: false, // Don't retry on auth errors
    staleTime: 30000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // Setup auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ["tender", id] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, id]);

  // Setup realtime subscription
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`tender-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenders',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log("Received tender update:", payload);
          queryClient.invalidateQueries({ queryKey: ["tender", id] });
          toast({
            title: "Tender Updated",
            description: "The tender information has been updated",
          });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [id, queryClient, toast]);

  return { tender, isLoading, error };
};
