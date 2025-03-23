
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { EvaluationCriterion } from "@/types/tender";

interface BidEvaluationFormProps {
  bidId: string;
  tenderId: string;
  criteria: EvaluationCriterion[];
  existingEvaluation?: {
    id: string;
    criteria_scores: Record<string, number>;
    comments: string;
    total_score: number;
  };
  bidderCriteriaScore: number;
  onEvaluationComplete: (totalScore: number) => void;
}

export default function BidEvaluationForm({
  bidId,
  tenderId,
  criteria,
  existingEvaluation,
  bidderCriteriaScore,
  onEvaluationComplete,
}: BidEvaluationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>(
    existingEvaluation?.criteria_scores || {}
  );
  const [comments, setComments] = useState(existingEvaluation?.comments || "");

  const calculateTotalScore = useCallback(() => {
    const evaluatorScore = criteria.reduce((total, criterion) => {
      const score = scores[criterion.id] || 0;
      return total + (score * criterion.weight) / 100;
    }, 0);

    return evaluatorScore + bidderCriteriaScore;
  }, [scores, criteria, bidderCriteriaScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all criteria have scores
    const missingScores = criteria.some(
      (criterion) => typeof scores[criterion.id] !== "number"
    );
    
    if (missingScores) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide scores for all criteria",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const totalScore = calculateTotalScore();
      const evaluationData = {
        bid_id: bidId,
        criteria_scores: scores,
        comments,
        total_score: totalScore,
      };

      let error;
      if (existingEvaluation) {
        ({ error } = await supabase
          .from("bid_evaluations")
          .update(evaluationData)
          .eq("id", existingEvaluation.id));
      } else {
        ({ error } = await supabase
          .from("bid_evaluations")
          .insert([evaluationData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: existingEvaluation
          ? "Evaluation updated successfully"
          : "Evaluation submitted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
      onEvaluationComplete(totalScore);
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit evaluation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingEvaluation ? "Update Evaluation" : "Evaluate Bid"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="space-y-2">
                <label className="text-sm font-medium">
                  {criterion.name} ({criterion.weight}%)
                  {criterion.description && (
                    <span className="block text-xs text-muted-foreground">
                      {criterion.description}
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={scores[criterion.id] || ""}
                  onChange={(e) =>
                    setScores({
                      ...scores,
                      [criterion.id]: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Score (0-100)"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comments</label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments about your evaluation"
              rows={4}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm space-y-1">
              <div>Bidder Criteria Score: {bidderCriteriaScore.toFixed(2)}</div>
              <div>Evaluator Criteria Score: {(calculateTotalScore() - bidderCriteriaScore).toFixed(2)}</div>
              <div className="font-medium">Total Score: {calculateTotalScore().toFixed(2)}</div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Submitting..."
                : existingEvaluation
                ? "Update Evaluation"
                : "Submit Evaluation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
