
import type { Bid, EvaluationCriterion } from "@/types/tender";

export const calculateTotalScore = (bid: Bid, evaluationCriteria: EvaluationCriterion[]): number => {
  let evaluatorTotal = 0;
  let bidderTotal = 0;
  const evaluation = bid.bid_evaluations?.[0];
  
  if (evaluation) {
    evaluationCriteria
      .filter(c => c.input_type === 'evaluator')
      .forEach(criterion => {
        const criterionScore = evaluation.criteria_scores[criterion.id];
        const score = typeof criterionScore === 'number' ? criterionScore : 0;
        const weight = typeof criterion.weight === 'number' ? criterion.weight : 0;
        evaluatorTotal += (score * weight) / 100;
      });
  }

  evaluationCriteria
    .filter(c => c.input_type === 'bidder')
    .forEach(criterion => {
      const response = bid.criteria_responses[criterion.id];
      const score = response && typeof response.score === 'number' ? response.score : 0;
      const weight = typeof criterion.weight === 'number' ? criterion.weight : 0;
      bidderTotal += (score * weight) / 100;
    });

  return evaluatorTotal + bidderTotal;
};

export const prepareBidScores = (bids: Bid[], evaluationCriteria: EvaluationCriterion[]) => {
  const sortedBids = [...bids].sort((a, b) => {
    const scoreA = calculateTotalScore(a, evaluationCriteria);
    const scoreB = calculateTotalScore(b, evaluationCriteria);
    return scoreB - scoreA;
  });

  const bidScores = sortedBids.reduce((acc, bid) => {
    acc[bid.id] = calculateTotalScore(bid, evaluationCriteria);
    return acc;
  }, {} as Record<string, number>);

  return { sortedBids, bidScores };
};
