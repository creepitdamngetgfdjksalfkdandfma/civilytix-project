
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface Milestone {
  id: string;
  tender_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: MilestoneStatus;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}
