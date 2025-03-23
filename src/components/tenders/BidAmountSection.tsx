
interface BidAmountSectionProps {
  amount: string;
  onAmountChange: (value: string) => void;
}

const BidAmountSection = ({ amount, onAmountChange }: BidAmountSectionProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="amount" className="text-sm font-medium">
        Bid Amount ($)
      </label>
      <input
        type="number"
        id="amount"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2"
        required
        min="0"
        step="0.01"
      />
    </div>
  );
};

export default BidAmountSection;
