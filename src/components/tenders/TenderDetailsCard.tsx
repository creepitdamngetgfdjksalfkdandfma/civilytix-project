
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { formatBudget } from "@/utils/tenderUtils";

interface TenderDetailsCardProps {
  tender: {
    tender_categories?: { name: string } | null;
    description?: string | null;
    budget_min: number | null;
    budget_max: number | null;
    start_date: string;
    end_date: string;
    eligibility_criteria?: unknown;
  };
}

export const TenderDetailsCard = ({ tender }: TenderDetailsCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getDeadlineText = (endDateString: string) => {
    try {
      const endDate = new Date(endDateString);
      // Check if the date is valid
      if (isNaN(endDate.getTime())) {
        console.error('Invalid end date:', endDateString);
        return 'Invalid deadline';
      }
      return formatDistance(endDate, new Date(), { addSuffix: true });
    } catch (error) {
      console.error('Error calculating deadline:', error);
      return 'Invalid deadline';
    }
  };

  // Add console logs to debug the tender data
  console.log('Tender data:', tender);
  console.log('Budget values:', { min: tender.budget_min, max: tender.budget_max });
  console.log('Dates:', { start: tender.start_date, end: tender.end_date });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tender Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Category</h3>
          <p>{tender.tender_categories?.name || 'No category assigned'}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Description</h3>
          <p className="text-muted-foreground">{tender.description || 'No description available'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Budget Range</h3>
          <p>{formatBudget(tender.budget_min, tender.budget_max)}</p>
        </div>

        <div>
          <h3 className="font-semibold">Timeline</h3>
          <div className="space-y-1">
            <p>Start Date: {formatDate(tender.start_date)}</p>
            <p>End Date: {formatDate(tender.end_date)}</p>
            <p className="text-sm text-muted-foreground">
              Deadline: {getDeadlineText(tender.end_date)}
            </p>
          </div>
        </div>

        {tender.eligibility_criteria && (
          <div>
            <h3 className="font-semibold">Eligibility Criteria</h3>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(tender.eligibility_criteria, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
