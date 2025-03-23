
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectUpdateType } from "@/types/project";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProjectUpdateFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  updateType: ProjectUpdateType;
  setUpdateType: (value: ProjectUpdateType) => void;
  completionPercentage: number;
  setCompletionPercentage: (value: number) => void;
  budgetUsed: number;
  setBudgetUsed: (value: number) => void;
  totalBudgetUtilized: number;
  maxBudget: number;
  economicImpact: 'low' | 'medium' | 'high';
  setEconomicImpact: (value: 'low' | 'medium' | 'high') => void;
  selectedFiles: File[];
  onFileSelect: (files: FileList | null) => void;
  onFileRemove: (index: number) => void;
}

export function ProjectUpdateFormFields({
  title,
  setTitle,
  description,
  setDescription,
  updateType,
  setUpdateType,
  completionPercentage,
  setCompletionPercentage,
  budgetUsed,
  setBudgetUsed,
  totalBudgetUtilized,
  maxBudget,
  economicImpact,
  setEconomicImpact,
  selectedFiles,
  onFileSelect,
  onFileRemove,
}: ProjectUpdateFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Update Type</label>
        <Select 
          value={updateType} 
          onValueChange={(value) => setUpdateType(value as ProjectUpdateType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select update type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="progress">Progress Update</SelectItem>
            <SelectItem value="budget">Budget Update</SelectItem>
            <SelectItem value="economic">Economic Impact</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Update title"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the update"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Completion Percentage</label>
        <Input
          type="number"
          min="0"
          max="100"
          value={completionPercentage}
          onChange={(e) => setCompletionPercentage(Number(e.target.value))}
          placeholder="Enter completion percentage (0-100)"
          className="w-full"
          required
        />
        <p className="text-xs text-muted-foreground">
          Current project completion: {completionPercentage}%
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Budget Used</label>
        <Input
          type="number"
          min="0"
          value={budgetUsed}
          onChange={(e) => setBudgetUsed(Number(e.target.value))}
          required
        />
        <p className="text-sm text-muted-foreground">
          Total Budget Utilized: ${totalBudgetUtilized.toLocaleString()} / ${maxBudget.toLocaleString()}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Economic Impact</label>
        <Select 
          value={economicImpact} 
          onValueChange={(value) => setEconomicImpact(value as 'low' | 'medium' | 'high')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select impact level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Attachments</label>
        <Input
          type="file"
          multiple
          onChange={(e) => onFileSelect(e.target.files)}
          className="w-full"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
        {selectedFiles.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-medium">Selected Files:</p>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileRemove(index)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
