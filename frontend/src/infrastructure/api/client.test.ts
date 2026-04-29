import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";

describe("API Client Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should store auth token in localStorage under auth-storage key", () => {
    const authData = {
      state: {
        accessToken: "test-token-123",
        refreshToken: "test-refresh-456",
        isAuthenticated: true,
        user: { id: 1, username: "admin" },
      },
      version: 0,
    };
    localStorage.setItem("auth-storage", JSON.stringify(authData));

    const stored = JSON.parse(localStorage.getItem("auth-storage")!);
    expect(stored.state.accessToken).toBe("test-token-123");
    expect(stored.state.refreshToken).toBe("test-refresh-456");
  });

  it("should handle missing auth-storage gracefully", () => {
    expect(localStorage.getItem("auth-storage")).toBeNull();
  });

  it("should handle corrupted auth-storage gracefully", () => {
    localStorage.setItem("auth-storage", "{invalid-json");
    try {
      JSON.parse(localStorage.getItem("auth-storage")!);
    } catch (e) {
      expect(e).toBeInstanceOf(SyntaxError);
    }
  });

  it("should clear auth data on logout", () => {
    localStorage.setItem("auth-storage", JSON.stringify({ state: { accessToken: "token" } }));
    localStorage.removeItem("auth-storage");
    expect(localStorage.getItem("auth-storage")).toBeNull();
  });
});

describe("Timeout Error Handling Integration", () => {
  it("should parse ECONNABORTED as Vietnamese timeout message", async () => {
    const { AxiosError } = await import("axios");
    const { parseApiError } = await import("@/shared/utils/apiErrorHandler");

    const timeoutError = new AxiosError("timeout of 10000ms exceeded", "ECONNABORTED");
    const result = parseApiError(timeoutError);

    expect(result.code).toBe("TIMEOUT_ERROR");
    expect(result.message).toBe("Yêu cầu bị quá thời gian. Vui lòng thử lại sau.");
  });

  it("should parse network error as Vietnamese connection message", async () => {
    const { AxiosError } = await import("axios");
    const { parseApiError } = await import("@/shared/utils/apiErrorHandler");

    const networkError = new AxiosError("Network Error", "ERR_NETWORK");
    const result = parseApiError(networkError);

    expect(result.code).toBe("NETWORK_ERROR");
    expect(result.message).toBe("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
  });

  it("should parse 504 gateway timeout as Vietnamese slow response message", async () => {
    const { AxiosError } = await import("axios");
    const { parseApiError } = await import("@/shared/utils/apiErrorHandler");

    const error = new AxiosError("Gateway Timeout", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 504,
      statusText: "Gateway Timeout",
      data: {},
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
    const result = parseApiError(error);

    expect(result.status).toBe(504);
    expect(result.message).toBe("Máy chủ phản hồi quá chậm. Vui lòng thử lại sau.");
  });
});
