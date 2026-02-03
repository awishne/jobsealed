export type JobStatus =
  | "draft"
  | "in-progress"
  | "completed"
  | "sealed";

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  customer_id: string;
  title: string | null;
  address: string | null;
  notes: string | null;
  status: JobStatus;
  public_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithCustomer extends Job {
  customers: { name: string } | null;
}
