import { describe, it, expect } from "vitest";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { parseApiError, getErrorMessage } from "@/shared/utils/apiErrorHandler";

const emptyConfig = {} as InternalAxiosRequestConfig;

describe("apiErrorHandler", () => {
  describe("parseApiError", () => {
    it("should handle network error", () => {
      const error = new AxiosError("Network Error", "ERR_NETWORK");
      const result = parseApiError(error);
      expect(result.message).toMatch(/không thể kết nối/i);
      expect(result.code).toBe("NETWORK_ERROR");
    });

    it("should handle timeout error via code", () => {
      const error = new AxiosError("timeout", "ECONNABORTED");
      const result = parseApiError(error);
      expect(result.message).toMatch(/quá thời gian/i);
      expect(result.code).toBe("TIMEOUT_ERROR");
    });

    it("should handle timeout error via message", () => {
      const error = new AxiosError("timeout of 10000ms exceeded");
      const result = parseApiError(error);
      expect(result.message).toMatch(/quá thời gian/i);
    });

    it("should handle 401 unauthorized", () => {
      const error = new AxiosError("Unauthorized", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/hết hạn.*đăng nhập/i);
      expect(result.status).toBe(401);
    });

    it("should handle 403 forbidden", () => {
      const error = new AxiosError("Forbidden", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 403,
        data: {},
        statusText: "Forbidden",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/không có quyền/i);
    });

    it("should handle 404 not found", () => {
      const error = new AxiosError("Not Found", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 404,
        data: {},
        statusText: "Not Found",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/không tìm thấy/i);
    });

    it("should handle 500 server error", () => {
      const error = new AxiosError("Internal Server Error", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 500,
        data: {},
        statusText: "Internal Server Error",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/lỗi máy chủ/i);
    });

    it("should handle 502 bad gateway", () => {
      const error = new AxiosError("Bad Gateway", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 502,
        data: {},
        statusText: "Bad Gateway",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/bảo trì/i);
    });

    it("should handle 504 gateway timeout", () => {
      const error = new AxiosError("Gateway Timeout", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 504,
        data: {},
        statusText: "Gateway Timeout",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/phản hồi quá chậm/i);
    });

    it("should handle 429 too many requests", () => {
      const error = new AxiosError("Too Many Requests", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 429,
        data: {},
        statusText: "Too Many Requests",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/quá nhiều yêu cầu/i);
    });

    it("should handle DRF detail message", () => {
      const error = new AxiosError("Bad Request", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 400,
        data: { detail: "Invalid input." },
        statusText: "Bad Request",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toBe("Invalid input.");
    });

    it("should handle field-specific DRF errors with Vietnamese labels", () => {
      const error = new AxiosError("Bad Request", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 400,
        data: { room_number: ["This field is required."], floor: ["Invalid value."] },
        statusText: "Bad Request",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toContain("Số phòng");
      expect(result.message).toContain("Tầng");
    });

    it("should handle data.message format", () => {
      const error = new AxiosError("Bad Request", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 400,
        data: { message: "Custom error from backend" },
        statusText: "Bad Request",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toBe("Custom error from backend");
    });

    it("should handle generic Error", () => {
      const error = new Error("Something went wrong");
      const result = parseApiError(error);
      expect(result.message).toBe("Something went wrong");
    });

    it("should handle unknown error type", () => {
      const result = parseApiError("unknown");
      expect(result.message).toMatch(/lỗi không xác định/i);
    });

    it("should handle unknown HTTP status", () => {
      const error = new AxiosError("Unknown", "ERR_BAD_RESPONSE", undefined, undefined, {
        status: 418,
        data: {},
        statusText: "I'm a teapot",
        headers: {},
        config: emptyConfig,
      });
      const result = parseApiError(error);
      expect(result.message).toMatch(/418/);
    });
  });

  describe("getErrorMessage", () => {
    it("should return Vietnamese message for network error", () => {
      const error = new AxiosError("Network Error", "ERR_NETWORK");
      expect(getErrorMessage(error)).toMatch(/không thể kết nối/i);
    });

    it("should return Vietnamese message for timeout", () => {
      const error = new AxiosError("timeout", "ECONNABORTED");
      expect(getErrorMessage(error)).toMatch(/quá thời gian/i);
    });
  });
});
