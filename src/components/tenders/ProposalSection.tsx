
import { Textarea } from "@/components/ui/textarea";

interface ProposalSectionProps {
  proposal: string;
  onChange: (value: string) => void;
}

const ProposalSection = ({ proposal, onChange }: ProposalSectionProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="proposal" className="text-sm font-medium">
        Technical Proposal
      </label>
      <Textarea
        id="proposal"
        value={proposal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your technical proposal details"
        required
        className="min-h-[150px]"
      />
    </div>
  );
};

export default ProposalSection;
