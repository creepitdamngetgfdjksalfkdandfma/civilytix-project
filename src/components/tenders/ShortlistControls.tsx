
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ShortlistControlsProps {
  shortlistAutomatically: boolean;
  threshold: string;
  onThresholdChange: (value: string) => void;
  onToggleAutoShortlist: () => void;
}

export default function ShortlistControls({
  shortlistAutomatically,
  threshold,
  onThresholdChange,
  onToggleAutoShortlist,
}: ShortlistControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-shortlist"
            checked={shortlistAutomatically}
            onCheckedChange={onToggleAutoShortlist}
          />
          <Label htmlFor="auto-shortlist">
            Automatic shortlisting
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="threshold" className="whitespace-nowrap">
            Threshold:
          </Label>
          <Input
            id="threshold"
            type="number"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => onThresholdChange(e.target.value)}
            className="w-20"
            disabled={!shortlistAutomatically}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
}
