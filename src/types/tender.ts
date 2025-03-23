
export type EvaluationCriterion = {
  id: string;
  name: string;
  description?: string;
  weight: number;
  input_type: 'bidder' | 'evaluator';
};

export type Specification = {
  id: string;
  name: string;
  description?: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
  required: boolean;
};

export type RequiredSpecification = {
  id: string;
  name: string;
  description?: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
  required: boolean;
};

export type TenderStatus = {
  completion_percentage: number;
  budget_utilized: number;
  last_updated: string;
};

export type Bid = {
  id: string;
  tender_id: string;
  bidder_id: string;
  amount: number;
  specifications: Record<string, any>;
  proposal: string;
  criteria_responses: Record<string, { score: number; justification: string }>;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'selected' | 'rejected';
  submitted_at: string;
  bid_evaluations: Array<{
    id: string;
    criteria_scores: Record<string, number>;
    comments: string;
    total_score: number;
  }>;
  profiles?: {
    full_name: string | null;
    organization: string | null;
  } | null;
};
