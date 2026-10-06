export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  source: 'meta' | 'test';
}

export interface MetaWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      field: string;
      value: {
        ad_id: string;
        form_id: string;
        leadgen_id: string;
        created_time: number;
        page_id: string;
        adgroup_id: string;
      };
    }>;
  }>;
}
