import { describe, it, expect } from "vitest";
import { queryKeys } from "@/infrastructure/api/queryKeys";

describe("queryKeys", () => {
  it("should have correct room query keys", () => {
    expect(queryKeys.rooms.all).toEqual(["rooms"]);
    expect(queryKeys.rooms.list()).toEqual(["rooms", "list", undefined]);
    expect(queryKeys.rooms.list({ floor: 1 })).toEqual(["rooms", "list", { floor: 1 }]);
    expect(queryKeys.rooms.detail(1)).toEqual(["rooms", "detail", 1]);
  });

  it("should have correct tenant query keys", () => {
    expect(queryKeys.tenants.all).toEqual(["tenants"]);
    expect(queryKeys.tenants.list()).toEqual(["tenants", "list"]);
    expect(queryKeys.tenants.detail(1)).toEqual(["tenants", "detail", 1]);
  });

  it("should have correct contract query keys", () => {
    expect(queryKeys.contracts.all).toEqual(["contracts"]);
    expect(queryKeys.contracts.list()).toEqual(["contracts", "list"]);
    expect(queryKeys.contracts.detail(1)).toEqual(["contracts", "detail", 1]);
  });

  it("should have correct bill query keys", () => {
    expect(queryKeys.bills.all).toEqual(["bills"]);
    expect(queryKeys.bills.list()).toEqual(["bills", "list"]);
    expect(queryKeys.bills.detail(1)).toEqual(["bills", "detail", 1]);
  });

  it("should have correct user query keys", () => {
    expect(queryKeys.users.all).toEqual(["users"]);
    expect(queryKeys.users.me()).toEqual(["users", "me"]);
  });
});