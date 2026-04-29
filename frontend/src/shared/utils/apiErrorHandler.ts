import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    // Network error (không có kết nối)
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return {
        message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
        code: "NETWORK_ERROR",
      };
    }

    // Timeout error
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return {
        message: "Yêu cầu bị quá thời gian. Vui lòng thử lại sau.",
        code: "TIMEOUT_ERROR",
      };
    }

    // Server trả về error response
    const status = error.response?.status;
    const data = error.response?.data;

    // Xử lý lỗi từ Django backend
    if (data?.message) {
      return { message: data.message, status };
    }

    if (data?.error) {
      return { message: data.error, status };
    }

    // Xử lý lỗi validation từ DRF
    if (data?.detail) {
      return { message: data.detail, status };
    }

    // Xử lý lỗi field-specific từ DRF
    if (typeof data === "object" && data !== null) {
      const fieldErrors = Object.entries(data)
        .filter(([, value]) => Array.isArray(value))
        .map(([field, errors]) => {
          const fieldLabel = getFieldLabel(field);
          return `${fieldLabel}: ${(errors as string[]).join(", ")}`;
        });

      if (fieldErrors.length > 0) {
        return { message: fieldErrors.join("\n"), status };
      }
    }

    // HTTP status codes
    switch (status) {
      case 400:
        return { message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.", status };
      case 401:
        return { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", status };
      case 403:
        return { message: "Bạn không có quyền thực hiện thao tác này.", status };
      case 404:
        return { message: "Không tìm thấy dữ liệu yêu cầu.", status };
      case 405:
        return { message: "Phương thức không được hỗ trợ.", status };
      case 409:
        return { message: "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.", status };
      case 422:
        return { message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.", status };
      case 429:
        return { message: "Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.", status };
      case 500:
        return { message: "Lỗi máy chủ. Vui lòng thử lại sau.", status };
      case 502:
        return { message: "Máy chủ đang bảo trì. Vui lòng thử lại sau.", status };
      case 503:
        return { message: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.", status };
      case 504:
        return { message: "Máy chủ phản hồi quá chậm. Vui lòng thử lại sau.", status };
      default:
        return {
          message: `Lỗi không xác định (${status || "không có mã"}). Vui lòng thử lại sau.`,
          status,
        };
    }
  }

  // Error không phải Axios
  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau." };
};

// Map tên trường tiếng Anh sang tiếng Việt
const getFieldLabel = (field: string): string => {
  const fieldLabels: Record<string, string> = {
    username: "Tên đăng nhập",
    password: "Mật khẩu",
    email: "Email",
    full_name: "Họ tên",
    phone: "Số điện thoại",
    role: "Vai trò",
    room_number: "Số phòng",
    floor: "Tầng",
    area: "Diện tích",
    base_price: "Giá cơ bản",
    status: "Trạng thái",
    amenities: "Tiện nghi",
    description: "Mô tả",
    landlord: "Chủ trọ",
    id_card: "CMND/CCCD",
    address: "Địa chỉ",
    emergency_contact: "Liên hệ khẩn cấp",
    start_date: "Ngày bắt đầu",
    end_date: "Ngày kết thúc",
    deposit_amount: "Tiền cọc",
    monthly_rent: "Tiền thuê",
    terms: "Điều khoản",
    contract: "Hợp đồng",
    tenant: "Người thuê",
    room: "Phòng",
    bill_month: "Tháng",
    bill_year: "Năm",
    room_price: "Giá phòng",
    electricity_previous: "Chỉ số điện cũ",
    electricity_current: "Chỉ số điện mới",
    electricity_price_per_unit: "Đơn giá điện",
    water_previous: "Chỉ số nước cũ",
    water_current: "Chỉ số nước mới",
    water_price_per_unit: "Đơn giá nước",
    other_fees: "Phí khác",
    other_fees_description: "Mô tả phí khác",
    due_date: "Hạn thanh toán",
    amount: "Số tiền",
    payment_method: "Phương thức thanh toán",
    payment_date: "Ngày thanh toán",
    notes: "Ghi chú",
    non_field_errors: "Lỗi chung",
  };

  return fieldLabels[field] || field;
};

// Helper để hiển thị thông báo thân thiện
export const getErrorMessage = (error: unknown): string => {
  const apiError = parseApiError(error);
  return apiError.message;
};