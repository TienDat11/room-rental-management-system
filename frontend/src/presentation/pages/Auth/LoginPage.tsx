import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import { UserOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "@/application/hooks/useAuth";
import { loginSchema, type LoginForm } from "@/domain/schemas/authSchema";

const { Title, Text, Paragraph } = Typography;

// Animated gradient keyframes
const gradientAnimation = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onFinish = async (values: LoginForm) => {
    try {
      await loginMutation.mutateAsync(values);
      message.success("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/"), 500);
    } catch {
      setError("root", { message: "Sai tên đăng nhập hoặc mật khẩu" });
      message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <>
      {/* Inject gradient animation styles */}
      <style>{gradientAnimation}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Left Side - Branding & Gradient */}
        <div
          style={{
            flex: "1 1 55%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px 80px",
            background: "linear-gradient(135deg, #001529 0%, #002140 25%, #0d3b66 50%, #1677ff 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 15s ease infinite",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative Circles */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "-10%",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "5%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.02)",
            }}
          />

          {/* Logo */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <HomeOutlined style={{ fontSize: 40, color: "#fff" }} />
          </div>

          {/* Title */}
          <Title level={1} style={{ color: "#fff", marginBottom: 16, fontWeight: 700, textAlign: "center" }}>
            Quản Lý Phòng Trọ
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 18,
              maxWidth: 400,
              textAlign: "center",
              lineHeight: 1.7,
              marginBottom: 40,
            }}
          >
            Hệ thống quản lý phòng trọ thông minh, giúp bạn quản lý phòng, người thuê, hợp đồng và hóa đơn một cách dễ dàng.
          </Paragraph>

          {/* Feature List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
            {[
              { icon: "🏠", text: "Quản lý phòng trọ trực quan" },
              { icon: "👥", text: "Theo dõi người thuê chi tiết" },
              { icon: "📄", text: "Quản lý hợp đồng tự động" },
              { icon: "💰", text: "Tính toán hóa đơn nhanh chóng" },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  backdropFilter: "blur(10px)",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>{item.text}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
          style={{
            flex: "1 1 45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 60px",
            background: "#fff",
          }}
        >
          <div style={{ width: "100%", maxWidth: 400 }}>
            {/* Header */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>
                Xin chào! 👋
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Đăng nhập để tiếp tục sử dụng hệ thống
              </Text>
            </div>

            {/* Login Form Card */}
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                border: "none",
              }}
              styles={{ body: { padding: "32px 24px" } }}
            >
              <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
                {/* Username Field */}
                <Form.Item
                  label={<Text style={{ fontWeight: 500 }}>Tên đăng nhập</Text>}
                  validateStatus={errors.username ? "error" : ""}
                  help={errors.username?.message}
                  style={{ marginBottom: 20 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
                    placeholder="Nhập tên đăng nhập"
                    size="large"
                    maxLength={50}
                    style={{ borderRadius: 10, height: 48 }}
                  />
                </Form.Item>

                {/* Password Field */}
                <Form.Item
                  label={<Text style={{ fontWeight: 500 }}>Mật khẩu</Text>}
                  validateStatus={errors.password ? "error" : ""}
                  help={errors.password?.message}
                  style={{ marginBottom: 12 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                    placeholder="Nhập mật khẩu"
                    size="large"
                    maxLength={128}
                    style={{ borderRadius: 10, height: 48 }}
                  />
                </Form.Item>

                {/* Forgot Password Link */}
                <div style={{ textAlign: "right", marginBottom: 20 }}>
                  <Link to="#" style={{ fontSize: 13, color: "#1677ff" }}>
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* Error Message */}
                {errors.root && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fff2f0",
                      border: "1px solid #ffccc7",
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ color: "#cf1322", fontSize: 13 }}>{errors.root.message}</Text>
                  </div>
                )}

                {/* Submit Button */}
                <Form.Item style={{ marginBottom: 20 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loginMutation.isPending}
                    style={{
                      borderRadius: 10,
                      height: 48,
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </Button>
                </Form.Item>

                {/* Divider */}
                <Divider style={{ margin: "20px 0" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>hoặc</Text>
                </Divider>

                {/* Register Link */}
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Chưa có tài khoản?{" "}
                    <Link to="/register" style={{ fontWeight: 600, color: "#1677ff" }}>
                      Đăng ký ngay
                    </Link>
                  </Text>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}