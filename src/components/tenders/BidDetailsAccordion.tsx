
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check } from "lucide-react";
import BidEvaluationForm from "./BidEvaluationForm";
import CriteriaAssessmentSection from "./CriteriaAssessmentSection";
import type { EvaluationCriterion } from "@/types/tender";

interface RequiredSpecification {
  id: string;
  name: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
  required: boolean;
}

interface Bid {
  id: string;
  amount: number;
  status: string;
  specifications: Record<string, any>;
  criteria_responses: Record<string, { score: number; justification: string }>;
  profiles?: {
    full_name: string | null;
    organization: string | null;
  } | null;
  bid_evaluations: Array<{
    id: string;
    criteria_scores: Record<string, number>;
    comments: string;
    total_score: number;
  }>;
}

interface BidDetailsAccordionProps {
  bids: Bid[];
  tenderId: string;
  evaluationCriteria: EvaluationCriterion[];
  requiredSpecifications: RequiredSpecification[];
  onEvaluationComplete: (bidId: string, totalScore: number) => void;
}

export default function BidDetailsAccordion({
  bids,
  tenderId,
  evaluationCriteria,
  requiredSpecifications,
  onEvaluationComplete,
}: BidDetailsAccordionProps) {
  const renderSpecificationValue = (spec: RequiredSpecification, value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-red-500">Not provided</span>;
    }

    if (spec.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return `${value}${spec.unit ? ` ${spec.unit}` : ''}`;
  };

  return (
    <Accordion type="single" collapsible className="space-y-4">
      {bids.map((bid) => (
        <AccordionItem key={bid.id} value={bid.id}>
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-1 text-left">
                  <div className="font-medium">
                    {bid.profiles?.organization || "Unknown Organization"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted by: {bid.profiles?.full_name || "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{bid.status}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-4 space-y-6">
                {evaluationCriteria.filter(c => c.input_type === 'bidder').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Bidder Self-Assessment</h4>
                    <CriteriaAssessmentSection 
                      criteria={evaluationCriteria.filter(c => c.input_type === 'bidder')}
                      responses={bid.criteria_responses}
                      onChange={() => {}} // No-op since this is read-only
                      readOnly={true}
                    />
                  </div>
                )}

                {requiredSpecifications.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Specifications</h4>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Specification
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Required Value
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted Value
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {requiredSpecifications.map((spec) => {
                            const value = bid.specifications[spec.id];
                            const isMissing = spec.required && (value === undefined || value === null);
                            
                            return (
                              <tr key={spec.id}>
                                <td className="px-4 py-2 text-sm">
                                  <span className="text-gray-900">
                                    {spec.name}
                                    {spec.required && <span className="text-red-500 ml-1">*</span>}
                                  </span>
                                  {spec.unit && (
                                    <span className="text-gray-500 text-xs ml-1">
                                      ({spec.unit})
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {spec.type === 'boolean' ? 'Yes/No' : 
                                   spec.type === 'number' ? `Number${spec.unit ? ` in ${spec.unit}` : ''}` : 
                                   'Text'}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {renderSpecificationValue(spec, value)}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {isMissing ? (
                                    <div className="flex items-center text-red-500">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      Missing
                                    </div>
                                  ) : value !== undefined && value !== null ? (
                                    <div className="flex items-center text-green-500">
                                      <Check className="h-4 w-4 mr-1" />
                                      Provided
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Optional</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <BidEvaluationForm
                  bidId={bid.id}
                  tenderId={tenderId}
                  criteria={evaluationCriteria.filter(c => c.input_type === 'evaluator')}
                  existingEvaluation={bid.bid_evaluations[0]}
                  bidderCriteriaScore={
                    evaluationCriteria
                      .filter(c => c.input_type === 'bidder')
                      .reduce((total, criterion) => {
                        const response = bid.criteria_responses[criterion.id];
                        const score = response && typeof response.score === 'number' ? response.score : 0;
                        const weight = typeof criterion.weight === 'number' ? criterion.weight : 0;
                        return total + (score * weight) / 100;
                      }, 0)
                  }
                  onEvaluationComplete={(totalScore) => onEvaluationComplete(bid.id, totalScore)}
                />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
