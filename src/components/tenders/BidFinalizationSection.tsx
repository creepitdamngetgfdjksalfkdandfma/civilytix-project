
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BidFinalizationSectionProps {
  tenderId: string;
  selectedBid?: {
    id: string;
    amount: number;
    profiles: {
      organization: string | null;
    };
  };
  shortlistedBids: Array<{
    id: string;
    amount: number;
    profiles: {
      organization: string | null;
    };
  }>;
  onBidFinalized: () => void;
}

export default function BidFinalizationSection({
  tenderId,
  selectedBid,
  shortlistedBids,
  onBidFinalized
}: BidFinalizationSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<string>(selectedBid?.id || '');
  const { toast } = useToast();

  const handleFinalizeBid = async () => {
    if (!selectedBidId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a bid to finalize",
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      // Update the tender with the winning bid
      const { error: tenderError } = await supabase
        .from('tenders')
        .update({
          winning_bid_id: selectedBidId,
          status: 'awarded'
        })
        .eq('id', tenderId);

      if (tenderError) throw tenderError;

      // Update the winning bid status
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'selected' })
        .eq('id', selectedBidId);

      if (bidError) throw bidError;

      // Update other bids to rejected
      const { error: otherBidsError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('tender_id', tenderId)
        .neq('id', selectedBidId);

      if (otherBidsError) throw otherBidsError;

      toast({
        title: "Success",
        description: "Bid has been finalized successfully",
      });
      
      onBidFinalized();
    } catch (error) {
      console.error('Error finalizing bid:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to finalize bid. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (shortlistedBids.length === 0) return null;

  const currentBid = shortlistedBids.find(bid => bid.id === selectedBidId);

  return (
    <Card className="glass hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Finalize Winning Bid
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Winning Bid</label>
            <Select
              value={selectedBidId}
              onValueChange={setSelectedBidId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a shortlisted bid" />
              </SelectTrigger>
              <SelectContent>
                {shortlistedBids.map((bid) => (
                  <SelectItem key={bid.id} value={bid.id} className="py-3">
                    <div className="flex items-center justify-between w-full">
                      <span>{bid.profiles?.organization || "Unknown Organization"}</span>
                      <span className="font-semibold">${bid.amount.toLocaleString()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentBid && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Selected Bidder</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {currentBid.profiles?.organization || "Unknown Organization"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Bid Amount</h4>
                <p className="text-lg font-semibold text-green-600">
                  ${currentBid.amount.toLocaleString()}
                </p>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleFinalizeBid} 
            disabled={isUpdating || !selectedBidId}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {isUpdating ? "Finalizing..." : "Finalize Bid"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
