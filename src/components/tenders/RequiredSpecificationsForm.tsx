
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { RequiredSpecification } from "@/types/tender";

interface RequiredSpecificationsFormProps {
  specifications: RequiredSpecification[];
  onChange: (specifications: RequiredSpecification[]) => void;
}

export function RequiredSpecificationsForm({
  specifications,
  onChange,
}: RequiredSpecificationsFormProps) {
  const [newSpec, setNewSpec] = useState<Partial<RequiredSpecification>>({});

  const addSpecification = () => {
    if (!newSpec.name || !newSpec.type) return;

    const specification: RequiredSpecification = {
      id: crypto.randomUUID(),
      name: newSpec.name,
      description: newSpec.description,
      type: newSpec.type as 'number' | 'text' | 'boolean',
      unit: newSpec.unit,
      required: newSpec.required ?? false,
    };

    onChange([...specifications, specification]);
    setNewSpec({});
  };

  const removeSpecification = (id: string) => {
    onChange(specifications.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {specifications.map((spec) => (
          <div key={spec.id} className="flex items-start space-x-4 p-4 border rounded-md">
            <div className="flex-1 space-y-2">
              <div className="font-medium">{spec.name}</div>
              {spec.description && (
                <div className="text-sm text-muted-foreground">{spec.description}</div>
              )}
              <div className="text-sm">
                Type: {spec.type}
                {spec.unit && ` (${spec.unit})`}
                {spec.required && " • Required"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSpecification(spec.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="text-sm font-medium">Add New Specification</div>
        <div className="grid gap-4">
          <div>
            <Input
              placeholder="Specification name"
              value={newSpec.name || ""}
              onChange={(e) =>
                setNewSpec({ ...newSpec, name: e.target.value })
              }
            />
          </div>
          <div>
            <Textarea
              placeholder="Description (optional)"
              value={newSpec.description || ""}
              onChange={(e) =>
                setNewSpec({ ...newSpec, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                value={newSpec.type}
                onValueChange={(value) =>
                  setNewSpec({ ...newSpec, type: value as 'number' | 'text' | 'boolean' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                placeholder="Unit (optional)"
                value={newSpec.unit || ""}
                onChange={(e) =>
                  setNewSpec({ ...newSpec, unit: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newSpec.required ?? false}
              onCheckedChange={(checked) =>
                setNewSpec({ ...newSpec, required: checked })
              }
            />
            <Label>Required</Label>
          </div>
        </div>
        <Button
          onClick={addSpecification}
          disabled={!newSpec.name || !newSpec.type}
        >
          Add Specification
        </Button>
      </div>
    </div>
  );
}
