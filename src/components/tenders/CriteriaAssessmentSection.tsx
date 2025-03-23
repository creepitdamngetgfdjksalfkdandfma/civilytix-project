
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EvaluationCriterion {
  id: string;
  name: string;
  description?: string;
  weight: number;
  input_type: 'bidder' | 'evaluator';
}

interface CriteriaResponses {
  [key: string]: {
    score: number;
    justification: string;
  };
}

interface CriteriaAssessmentSectionProps {
  criteria: EvaluationCriterion[];
  responses: CriteriaResponses;
  onChange: (criterionId: string, field: 'score' | 'justification', value: string | number) => void;
  readOnly?: boolean;
}

const CriteriaAssessmentSection = ({
  criteria,
  responses,
  onChange,
  readOnly = false,
}: CriteriaAssessmentSectionProps) => {
  if (!criteria || criteria.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Self-Assessment Criteria</h3>
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{criterion.name}</h4>
                {criterion.description && (
                  <p className="text-sm text-muted-foreground mt-1">{criterion.description}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{criterion.weight}%</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Self-Assessment Score (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={responses[criterion.id]?.score || ''}
                  onChange={(e) => onChange(criterion.id, 'score', parseFloat(e.target.value))}
                  className="mt-1"
                  required
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Justification</label>
                <Textarea
                  value={responses[criterion.id]?.justification || ''}
                  onChange={(e) => onChange(criterion.id, 'justification', e.target.value)}
                  placeholder="Explain how you meet this criterion"
                  className="mt-1"
                  required
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriteriaAssessmentSection;
