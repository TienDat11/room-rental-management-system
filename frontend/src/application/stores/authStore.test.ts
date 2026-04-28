import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/application/stores/authStore";

describe("authStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  it("should have correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should set tokens on login", () => {
    const { setTokens } = useAuthStore.getState();
    setTokens("test-access-token", "test-refresh-token");

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("test-access-token");
    expect(state.refreshToken).toBe("test-refresh-token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("should clear tokens on logout", () => {
    const { setTokens, logout } = useAuthStore.getState();
    setTokens("test-access-token", "test-refresh-token");

    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});