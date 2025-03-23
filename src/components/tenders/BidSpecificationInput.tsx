
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Specification {
  id: string;
  name: string;
  description?: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
  required: boolean;
}

interface BidSpecificationInputProps {
  specification: Specification;
  value: any;
  onChange: (value: any) => void;
}

const BidSpecificationInput = ({
  specification: spec,
  value,
  onChange,
}: BidSpecificationInputProps) => {
  if (spec.type === 'boolean') {
    return (
      <Select 
        value={value?.toString() || ''} 
        onValueChange={(val) => onChange(val === 'true')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={spec.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      onChange={(e) => onChange(
        spec.type === 'number' ? parseFloat(e.target.value) : e.target.value
      )}
      placeholder={`Enter ${spec.name.toLowerCase()}${spec.unit ? ` (${spec.unit})` : ''}`}
      required={spec.required}
    />
  );
};

export default BidSpecificationInput;
