export type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface Contract {
  id: number;
  tenant: number;
  tenant_name: string;
  room: number;
  room_number: string;
  landlord: number;
  landlord_name: string;
  start_date: string;
  end_date: string;
  deposit_amount: string;
  monthly_rent: string;
  status: ContractStatus;
  status_display: string;
  terms: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ContractCreate {
  tenant: number;
  room: number;
  start_date: string;
  end_date: string;
  deposit_amount?: string;
  monthly_rent: string;
  terms?: string;
  notes?: string;
}

export type ContractUpdate = Partial<ContractCreate>;
