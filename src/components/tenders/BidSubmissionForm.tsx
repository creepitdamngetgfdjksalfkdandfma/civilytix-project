
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BidAmountSection from "@/components/tenders/BidAmountSection";
import BidSpecificationsSection from "@/components/tenders/BidSpecificationsSection";
import ProposalSection from "@/components/tenders/ProposalSection";
import CriteriaAssessmentSection from "@/components/tenders/CriteriaAssessmentSection";
import type { EvaluationCriterion, RequiredSpecification } from "@/types/tender";

interface BidSubmissionFormProps {
  tenderId: string;
  tender: {
    required_specifications: RequiredSpecification[];
    evaluation_criteria: EvaluationCriterion[];
  };
  onBidSubmitted: () => void;
}

export default function BidSubmissionForm({
  tenderId,
  tender,
  onBidSubmitted,
}: BidSubmissionFormProps) {
  const [amount, setAmount] = useState<string>('0');
  const [specifications, setSpecifications] = useState<Record<string, any>>({});
  const [proposal, setProposal] = useState<string>("");
  const [criteriaResponses, setCriteriaResponses] = useState<Record<string, { score: number; justification: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Check if user has already submitted a bid for this tender
      const { data: existingBids } = await supabase
        .from("bids")
        .select("id")
        .eq("tender_id", tenderId)
        .eq("bidder_id", userData.user.id)
        .single();

      if (existingBids) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You have already submitted a bid for this tender.",
        });
        return;
      }

      // Start a transaction by inserting the bid
      const { error: bidError } = await supabase.from("bids").insert({
        tender_id: tenderId,
        bidder_id: userData.user.id,
        amount: parseFloat(amount),
        specifications: specifications,
        proposal: proposal,
        criteria_responses: criteriaResponses,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      });

      if (bidError) {
        console.error("Error submitting bid:", bidError);
        throw bidError;
      }

      toast({
        title: "Success",
        description: "Bid submitted successfully",
      });
      onBidSubmitted();
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit bid. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCriteriaChange = (criterionId: string, field: 'score' | 'justification', value: string | number) => {
    setCriteriaResponses(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: value,
      },
    }));
  };

  const handleSpecificationChange = (id: string, value: any) => {
    setSpecifications(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Filter criteria for bidder input
  const bidderCriteria = tender.evaluation_criteria.filter(
    criterion => criterion.input_type === 'bidder'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Bid</CardTitle>
        <CardDescription>
          Fill in the required information to submit your bid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <BidAmountSection
            amount={amount}
            onAmountChange={setAmount}
          />

          {tender.required_specifications.length > 0 && (
            <BidSpecificationsSection
              specifications={tender.required_specifications}
              values={specifications}
              onChange={handleSpecificationChange}
            />
          )}

          {bidderCriteria.length > 0 && (
            <CriteriaAssessmentSection
              criteria={bidderCriteria}
              responses={criteriaResponses}
              onChange={handleCriteriaChange}
            />
          )}

          <ProposalSection
            proposal={proposal}
            onChange={(value: string) => setProposal(value)}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Bid"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
