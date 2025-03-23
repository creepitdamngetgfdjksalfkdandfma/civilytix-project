
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TenderDetailsCard } from "@/components/tenders/TenderDetailsCard";
import BidSubmissionForm from "@/components/tenders/BidSubmissionForm";
import BidList from "@/components/tenders/BidList";
import BidFinalizationSection from "@/components/tenders/BidFinalizationSection";
import TenderAnnouncements from "@/components/tenders/TenderAnnouncements";
import ProjectUpdatesList from "@/components/tenders/ProjectUpdatesList";
import ProjectUpdateForm from "@/components/tenders/ProjectUpdateForm";
import { MilestonesList } from "@/components/tenders/MilestonesList";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TenderContentProps {
  tender: any;
  tenderId: string;
  userRole: string | null;
}

export const TenderContent = ({ tender, tenderId, userRole }: TenderContentProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasSubmittedBid, setHasSubmittedBid] = useState(false);
  
  const winningBid = tender.bids?.find((bid: any) => bid.status === 'selected');
  const shortlistedBids = tender.bids?.filter((bid: any) => bid.status === 'shortlisted') || [];
  const isGovernmentUser = userRole === 'government';
  
  // Check if the current user has already submitted a bid
  useEffect(() => {
    const checkUserBid = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasSubmittedBid(false);
        return;
      }
      
      const hasBid = tender.bids?.some((bid: any) => bid.bidder_id === user.id);
      setHasSubmittedBid(hasBid);
    };

    checkUserBid();
  }, [tender.bids]);

  // Show bid form if:
  // 1. Tender is either 'active' or 'under_evaluation'
  // 2. User is a bidder
  // 3. User hasn't submitted a bid yet
  const showBidForm = (tender.status === 'active' || tender.status === 'under_evaluation') && 
                     userRole === 'bidder' && 
                     !hasSubmittedBid;
                     
  const showBidList = isGovernmentUser;
  
  // Check if tender is in a state where project updates should be shown
  const showProjectUpdates = tender.status === 'awarded' || tender.status === 'closed';

  // Check if current bidder is the winner
  const isWinningBidder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user && winningBid && winningBid.bidder_id === user.id;
  };

  console.log('Tender status:', tender.status);
  console.log('User role:', userRole);
  console.log('Has submitted bid:', hasSubmittedBid);
  console.log('Show bid form:', showBidForm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-down">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{tender.title}</h1>
          <p className="text-gray-600">{tender.description}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="animate-fade-up">
              <TenderDetailsCard tender={tender} />
            </div>

            <div className="animate-fade-up delay-200">
              <TenderAnnouncements tenderId={tenderId} isGovernmentUser={isGovernmentUser} />
            </div>

            {showProjectUpdates && (
              <div className="space-y-8 animate-fade-up delay-300">
                <ProjectUpdatesList tenderId={tenderId} />
                <MilestonesList tenderId={tenderId} isGovernmentUser={isGovernmentUser} />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {showBidForm && (
              <div className="animate-fade-up">
                <Card className="glass hover:shadow-lg transition-shadow">
                  <BidSubmissionForm
                    tenderId={tenderId}
                    tender={{
                      required_specifications: tender.required_specifications,
                      evaluation_criteria: tender.evaluation_criteria
                    }}
                    onBidSubmitted={() => {
                      setHasSubmittedBid(true);
                      queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
                      toast({
                        title: "Success",
                        description: "Your bid has been submitted successfully.",
                      });
                    }}
                  />
                </Card>
              </div>
            )}

            {showBidList && (
              <div className="animate-fade-up delay-100">
                <Card className="glass">
                  <BidList
                    bids={tender.bids || []}
                    tenderId={tenderId}
                    evaluationCriteria={tender.evaluation_criteria}
                    requiredSpecifications={tender.required_specifications}
                    shortlistThreshold={tender.shortlist_threshold}
                    shortlistAutomatically={tender.shortlist_automatically}
                  />
                </Card>
              </div>
            )}

            {isGovernmentUser && shortlistedBids.length > 0 && !winningBid && (
              <div className="animate-fade-up delay-200">
                <BidFinalizationSection
                  tenderId={tenderId}
                  selectedBid={winningBid}
                  shortlistedBids={shortlistedBids}
                  onBidFinalized={() => {
                    queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
                    toast({
                      title: "Success",
                      description: "Bid has been finalized successfully.",
                    });
                  }}
                />
              </div>
            )}

            {showProjectUpdates && userRole === 'bidder' && winningBid && (
              <div className="animate-fade-up delay-300">
                <Card className="glass">
                  <ProjectUpdateForm
                    tenderId={tenderId}
                    onUpdateSubmitted={() => {
                      queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
                      toast({
                        title: "Success",
                        description: "Project update submitted successfully.",
                      });
                    }}
                  />
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
