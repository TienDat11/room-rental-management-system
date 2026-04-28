export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export interface Room {
  id: number;
  room_number: string;
  floor: number;
  area: number;
  base_price: string;
  status: RoomStatus;
  status_display: string;
  amenities: string;
  description: string;
  landlord: number;
  landlord_name: string;
  images: RoomImage[];
  created_at: string;
  updated_at: string;
}

export interface RoomImage {
  id: number;
  image: string;
  caption: string;
  is_primary: boolean;
}

export interface RoomCreate {
  room_number: string;
  floor: number;
  area: number;
  base_price: string;
  amenities?: string;
  description?: string;
}

export type RoomUpdate = Partial<RoomCreate>;

export interface RoomFilters {
  floor?: number;
  status?: RoomStatus;
  search?: string;
}
