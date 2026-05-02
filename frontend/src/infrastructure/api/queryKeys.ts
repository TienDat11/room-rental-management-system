interface RoomFilters {
  floor?: number;
  status?: string;
  search?: string;
}

export const queryKeys = {
  rooms: {
    all: ["rooms"] as const,
    list: (filters?: RoomFilters) => ["rooms", "list", filters] as const,
    detail: (id: number) => ["rooms", "detail", id] as const,
  },
  tenants: {
    all: ["tenants"] as const,
    list: () => ["tenants", "list"] as const,
    detail: (id: number) => ["tenants", "detail", id] as const,
  },
  contracts: {
    all: ["contracts"] as const,
    list: () => ["contracts", "list"] as const,
    detail: (id: number) => ["contracts", "detail", id] as const,
  },
  bills: {
    all: ["bills"] as const,
    list: () => ["bills", "list"] as const,
    detail: (id: number) => ["bills", "detail", id] as const,
  },
  users: {
    all: ["users"] as const,
    me: () => ["users", "me"] as const,
    list: () => ["users", "list"] as const,
    detail: (id: number) => ["users", "detail", id] as const,
  },
} as const;
