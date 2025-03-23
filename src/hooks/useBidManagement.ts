
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface UseBidManagementProps {
  tenderId: string;
  shortlistThreshold?: number;
}

export const useBidManagement = ({ tenderId, shortlistThreshold = 70 }: UseBidManagementProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [threshold, setThreshold] = useState(shortlistThreshold.toString());

  const handleShortlistBid = async (bidId: string) => {
    const { error } = await supabase
      .from('bids')
      .update({ status: 'shortlisted' })
      .eq('id', bidId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to shortlist bid. Please try again.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Bid has been shortlisted",
    });

    queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
  };

  const handleRemoveShortlist = async (bidId: string) => {
    const { error } = await supabase
      .from('bids')
      .update({ status: 'submitted' })
      .eq('id', bidId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove bid from shortlist. Please try again.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Bid has been removed from shortlist",
    });

    queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
  };

  const handleToggleAutoShortlist = async (shortlistAutomatically: boolean) => {
    const thresholdValue = parseFloat(threshold);
    if (isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 100) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid threshold between 0 and 100",
      });
      return;
    }

    try {
      const { error: settingsError } = await supabase
        .from('tenders')
        .update({ 
          shortlist_automatically: !shortlistAutomatically,
          shortlist_threshold: thresholdValue
        })
        .eq('id', tenderId);

      if (settingsError) throw settingsError;

      toast({
        title: "Success",
        description: `Automatic shortlisting ${!shortlistAutomatically ? 'enabled' : 'disabled'}`,
      });

      queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
    } catch (error) {
      console.error('Error updating shortlist settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update shortlist settings. Please try again.",
      });
    }
  };

  return {
    threshold,
    setThreshold,
    handleShortlistBid,
    handleRemoveShortlist,
    handleToggleAutoShortlist,
  };
};
