export type BillStatus = "PENDING" | "PAID" | "OVERDUE";

export interface Bill {
  id: number;
  contract: number;
  room: number;
  room_number: string;
  tenant: number;
  tenant_name: string;
  bill_month: number;
  bill_year: number;
  room_price: string;
  electricity_previous: string;
  electricity_current: string;
  electricity_usage: string;
  electricity_price_per_unit: string;
  electricity_cost: string;
  water_previous: string;
  water_current: string;
  water_usage: string;
  water_price_per_unit: string;
  water_cost: string;
  other_fees: string;
  other_fees_description: string;
  total_amount: string;
  status: BillStatus;
  status_display: string;
  due_date: string;
  paid_date: string | null;
  notes: string;
  payments: Payment[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  bill: number;
  amount: string;
  payment_method: "CASH" | "TRANSFER";
  method_display: string;
  payment_date: string;
  notes: string;
  created_at: string;
}

export interface BillCreate {
  contract: number;
  room: number;
  tenant: number;
  bill_month: number;
  bill_year: number;
  room_price: string;
  electricity_previous?: string;
  electricity_current?: string;
  electricity_price_per_unit?: string;
  water_previous?: string;
  water_current?: string;
  water_price_per_unit?: string;
  other_fees?: string;
  other_fees_description?: string;
  due_date: string;
  notes?: string;
}

export interface PaymentCreate {
  amount: string;
  payment_method: "CASH" | "TRANSFER";
  payment_date: string;
  notes?: string;
}
