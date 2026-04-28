export interface Tenant {
  id: number;
  full_name: string;
  id_card: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  address: string;
  emergency_contact: string;
  room: number | null;
  room_number: string | null;
  status: "ACTIVE" | "INACTIVE";
  status_display: string;
  notes: string;
  landlord: number;
  created_at: string;
  updated_at: string;
}

export interface TenantCreate {
  full_name: string;
  id_card: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  room?: number;
  status?: "ACTIVE" | "INACTIVE";
  notes?: string;
}

export type TenantUpdate = Partial<TenantCreate>;
