
import type { EvaluationCriterion, RequiredSpecification } from "@/types/tender";

export const formatBudget = (min: number | null, max: number | null): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  if (min === null && max === null) return 'Not specified';
  if (min === null) return `Up to ${formatter.format(max!)}`;
  if (max === null) return `From ${formatter.format(min)}`;
  if (min === max) return formatter.format(min);
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

export const parseEvaluationCriteria = (criteriaJson: any): EvaluationCriterion[] => {
  if (!criteriaJson || !Array.isArray(criteriaJson)) return [];
  return criteriaJson;
};

export const parseBidSpecifications = (specificationsJson: any): Record<string, any> => {
  if (!specificationsJson || typeof specificationsJson !== 'object') return {};
  return specificationsJson;
};

export const parseCriteriaScores = (scoresJson: any): Record<string, number> => {
  if (!scoresJson || typeof scoresJson !== 'object') return {};
  return scoresJson;
};

interface CriteriaResponse {
  score: number;
  justification: string;
}

export const parseCriteriaResponses = (responses: any): Record<string, CriteriaResponse> => {
  if (!responses) return {};
  
  return Object.entries(responses).reduce((acc, [key, value]) => {
    if (typeof value === 'number') {
      // Handle old format where value was just a number
      acc[key] = {
        score: value,
        justification: ''
      };
    } else if (value && typeof value === 'object') {
      // Handle new format where value is an object with score and justification
      const valueObj = value as Record<string, unknown>;
      acc[key] = {
        score: typeof valueObj.score === 'number' ? valueObj.score : 0,
        justification: typeof valueObj.justification === 'string' ? valueObj.justification : ''
      };
    } else {
      // Handle invalid data
      acc[key] = {
        score: 0,
        justification: ''
      };
    }
    return acc;
  }, {} as Record<string, CriteriaResponse>);
};

export const parseRequiredSpecifications = (specificationsJson: any): RequiredSpecification[] => {
  if (!specificationsJson || !Array.isArray(specificationsJson)) return [];
  return specificationsJson;
};
