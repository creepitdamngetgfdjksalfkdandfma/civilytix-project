
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Milestone } from "@/types/milestone";
import { useToast } from "@/components/ui/use-toast";

export function useMilestones(tenderId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["milestones", tenderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("tender_id", tenderId)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as Milestone[];
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (milestone: Omit<Milestone, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("milestones")
        .insert([milestone])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", tenderId] });
      toast({
        title: "Success",
        description: "Milestone created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create milestone: " + error.message,
      });
    },
  });

  const updateMilestone = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Milestone> & { id: string }) => {
      const { data, error } = await supabase
        .from("milestones")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", tenderId] });
      toast({
        title: "Success",
        description: "Milestone updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update milestone: " + error.message,
      });
    },
  });

  return {
    milestones,
    isLoading,
    createMilestone,
    updateMilestone,
  };
}
