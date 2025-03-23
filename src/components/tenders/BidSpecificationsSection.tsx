
import type { Specification } from "@/types/tender";
import BidSpecificationInput from "./BidSpecificationInput";

interface BidSpecificationsSectionProps {
  specifications: Specification[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
}

const BidSpecificationsSection = ({
  specifications,
  values,
  onChange,
}: BidSpecificationsSectionProps) => {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Required Specifications</h3>
      {specifications.map((spec) => (
        <div key={spec.id} className="space-y-2">
          <label className="text-sm font-medium">
            {spec.name}
            {spec.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {spec.description && (
            <p className="text-sm text-muted-foreground">{spec.description}</p>
          )}
          <BidSpecificationInput
            specification={spec}
            value={values[spec.id]}
            onChange={(value) => onChange(spec.id, value)}
          />
        </div>
      ))}
    </div>
  );
};

export default BidSpecificationsSection;
