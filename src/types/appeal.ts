
export type AppealStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface BidAppeal {
  id: string;
  bid_id: string;
  submitted_by: string;
  reason: string;
  status: AppealStatus;
  reviewer_comments?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    organization: string | null;
  } | null;
}
