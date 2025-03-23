
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import type { EvaluationCriterion } from "@/types/tender";

interface EvaluationCriteriaFormProps {
  criteria: EvaluationCriterion[];
  onChange: (criteria: EvaluationCriterion[]) => void;
}

export function EvaluationCriteriaForm({ criteria, onChange }: EvaluationCriteriaFormProps) {
  const [newCriterion, setNewCriterion] = useState<Partial<EvaluationCriterion>>({
    input_type: 'evaluator' // Set default, but will be overridden by select
  });

  const addCriterion = () => {
    if (!newCriterion.name || !newCriterion.weight) return;

    const criterion: EvaluationCriterion = {
      id: crypto.randomUUID(),
      name: newCriterion.name,
      description: newCriterion.description || '',
      weight: Number(newCriterion.weight),
      input_type: newCriterion.input_type as 'bidder' | 'evaluator'
    };

    onChange([...criteria, criterion]);
    setNewCriterion({ input_type: 'evaluator' }); // Reset with default input_type
  };

  const removeCriterion = (id: string) => {
    onChange(criteria.filter((c) => c.id !== id));
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="flex items-start space-x-4 p-4 border rounded-md">
            <div className="flex-1 space-y-2">
              <div className="font-medium">{criterion.name}</div>
              {criterion.description && (
                <div className="text-sm text-muted-foreground">{criterion.description}</div>
              )}
              <div className="text-sm">Weight: {criterion.weight}%</div>
              <div className="text-sm text-muted-foreground">
                Input type: {criterion.input_type}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCriterion(criterion.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="text-sm font-medium">Add New Criterion</div>
        <div className="grid gap-4">
          <div>
            <Input
              placeholder="Criterion name"
              value={newCriterion.name || ""}
              onChange={(e) =>
                setNewCriterion({ ...newCriterion, name: e.target.value })
              }
            />
          </div>
          <div>
            <Textarea
              placeholder="Description (optional)"
              value={newCriterion.description || ""}
              onChange={(e) =>
                setNewCriterion({ ...newCriterion, description: e.target.value })
              }
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Weight (%)"
              value={newCriterion.weight || ""}
              onChange={(e) =>
                setNewCriterion({ ...newCriterion, weight: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <select
              className="w-full border border-input bg-background px-3 py-2 rounded-md"
              value={newCriterion.input_type}
              onChange={(e) =>
                setNewCriterion({ ...newCriterion, input_type: e.target.value as 'bidder' | 'evaluator' })
              }
            >
              <option value="evaluator">Evaluator Input</option>
              <option value="bidder">Bidder Input</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Total Weight: {totalWeight}%
          </div>
          <Button
            onClick={addCriterion}
            disabled={!newCriterion.name || !newCriterion.weight || totalWeight + Number(newCriterion.weight) > 100}
          >
            Add Criterion
          </Button>
        </div>
      </div>
    </div>
  );
}
