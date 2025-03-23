
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProjectBudget(tenderId: string) {
  const [totalBudgetUtilized, setTotalBudgetUtilized] = useState(0);
  const [maxBudget, setMaxBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBudgetInfo = async () => {
      try {
        setIsLoading(true);
        // Fetch tender's max budget
        const { data: tenderData, error: tenderError } = await supabase
          .from('tenders')
          .select('budget_max')
          .eq('id', tenderId)
          .single();

        if (tenderError) throw tenderError;

        // Fetch all previous project updates
        const { data: updates, error: updatesError } = await supabase
          .from('project_updates')
          .select('metrics')
          .eq('tender_id', tenderId)
          .eq('is_published', true);

        if (updatesError) throw updatesError;

        const totalUtilized = updates?.reduce((acc, update) => {
          const metrics = update.metrics as { budget_used?: number };
          return acc + (metrics?.budget_used || 0);
        }, 0);

        setMaxBudget(tenderData?.budget_max || 0);
        setTotalBudgetUtilized(totalUtilized || 0);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching budget info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetInfo();
  }, [tenderId]);

  return { totalBudgetUtilized, maxBudget, isLoading, error };
}
