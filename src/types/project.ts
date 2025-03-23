
export type ProjectUpdateType = 'progress' | 'budget' | 'economic' | 'milestone';

export type ProjectMetrics = {
  budget_used: number;
  total_budget: number;
  completion_percentage: number;
  economic_impact: 'low' | 'medium' | 'high';
};

export type ProjectUpdate = {
  id: string;
  tender_id: string;
  created_by: string;
  created_at: string;
  update_type: ProjectUpdateType;
  title: string;
  description?: string;
  metrics: ProjectMetrics;
  attachments: string[];
  status?: string;
  is_published: boolean;
  profiles?: {
    organization: string | null;
  };
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  department: string;
  budget_allocated: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  project_type_id?: string;
};

export type ProjectWithTenders = Project & {
  tenders: {
    id: string;
    title: string;
    status: string;
    budget_min: number;
    budget_max: number;
    start_date: string;
    end_date: string;
  }[];
};
