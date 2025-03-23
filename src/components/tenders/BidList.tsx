
import { Card, CardContent } from "@/components/ui/card";
import type { Bid, EvaluationCriterion } from "@/types/tender";
import BidScoreChart from "./BidScoreChart";
import BidRankingsTable from "./BidRankingsTable";
import BidDetailsAccordion from "./BidDetailsAccordion";
import ShortlistControls from "./ShortlistControls";
import { useBidManagement } from "@/hooks/useBidManagement";
import { prepareBidScores } from "@/utils/bidScoreCalculations";

interface RequiredSpecification {
  id: string;
  name: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
  required: boolean;
}

interface BidListProps {
  bids: Bid[];
  tenderId: string;
  evaluationCriteria: EvaluationCriterion[];
  requiredSpecifications?: RequiredSpecification[];
  shortlistThreshold?: number;
  shortlistAutomatically?: boolean;
}

export default function BidList({
  bids,
  tenderId,
  evaluationCriteria,
  requiredSpecifications = [],
  shortlistThreshold = 70,
  shortlistAutomatically = false,
}: BidListProps) {
  const {
    threshold,
    setThreshold,
    handleShortlistBid,
    handleRemoveShortlist,
    handleToggleAutoShortlist,
  } = useBidManagement({ tenderId, shortlistThreshold });

  if (!bids.length) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-center text-muted-foreground">No bids submitted yet</p>
        </CardContent>
      </Card>
    );
  }

  const { sortedBids, bidScores } = prepareBidScores(bids, evaluationCriteria);

  const chartData = sortedBids.map(bid => ({
    name: bid.profiles?.organization || "Unknown",
    score: bidScores[bid.id],
    status: bid.status,
  }));

  const handleEvaluationComplete = async (bidId: string, totalScore: number) => {
    if (shortlistAutomatically && totalScore >= parseFloat(threshold)) {
      await handleShortlistBid(bidId);
    }
  };

  return (
    <div className="space-y-6">
      <ShortlistControls
        shortlistAutomatically={shortlistAutomatically}
        threshold={threshold}
        onThresholdChange={setThreshold}
        onToggleAutoShortlist={() => handleToggleAutoShortlist(shortlistAutomatically)}
      />

      <BidScoreChart
        bids={chartData}
        shortlistThreshold={parseFloat(threshold)}
        shortlistAutomatically={shortlistAutomatically}
      />

      <BidRankingsTable
        bids={sortedBids}
        scores={bidScores}
        onShortlist={handleShortlistBid}
        onRemoveShortlist={handleRemoveShortlist}
      />

      <BidDetailsAccordion
        bids={sortedBids}
        tenderId={tenderId}
        evaluationCriteria={evaluationCriteria}
        requiredSpecifications={requiredSpecifications}
        onEvaluationComplete={handleEvaluationComplete}
      />
    </div>
  );
}
