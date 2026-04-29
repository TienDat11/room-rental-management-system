import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Card, Select, Typography, message, Steps } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "@/application/hooks/useAuth";
import { registerSchema, type RegisterForm } from "@/domain/schemas/authSchema";

const { Title, Text, Paragraph } = Typography;

const gradientAnimation = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "LANDLORD" },
  });

  const onFinish = async (values: RegisterForm) => {
    try {
      await registerMutation.mutateAsync(values);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch {
      setError("root", { message: "Đăng ký thất bại. Vui lòng thử lại." });
      message.error("Đăng ký thất bại");
    }
  };

  return (
    <>
      <style>{gradientAnimation}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            flex: "1 1 50%",
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
          <div
            style={{ position: "absolute", top: "10%", left: "-8%", width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }}
          />
          <div
            style={{ position: "absolute", bottom: "5%", right: "-5%", width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.02)" }}
          />

          <div
            style={{
              width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28,
            }}
          >
            <HomeOutlined style={{ fontSize: 36, color: "#fff" }} />
          </div>

          <Title level={1} style={{ color: "#fff", marginBottom: 16, fontWeight: 700, textAlign: "center" }}>
            Tham Gia Ngay!
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, maxWidth: 380, textAlign: "center", lineHeight: 1.7, marginBottom: 40 }}>
            Tạo tài khoản để bắt đầu quản lý phòng trọ hiệu quả và chuyên nghiệp.
          </Paragraph>

          <div style={{ maxWidth: 360, width: "100%" }}>
            <Steps
              direction="vertical"
              size="small"
              current={-1}
              items={[
                {
                  title: <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: 14 }}>Điền thông tin</Text>,
                  description: <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Cung cấp thông tin cá nhân</Text>,
                  icon: <span style={{ fontSize: 18 }}>📝</span>,
                },
                {
                  title: <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: 14 }}>Xác thực</Text>,
                  description: <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Hệ thống xác nhận tài khoản</Text>,
                  icon: <span style={{ fontSize: 18 }}>✅</span>,
                },
                {
                  title: <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: 14 }}>Bắt đầu sử dụng</Text>,
                  description: <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Đăng nhập và quản lý phòng trọ</Text>,
                  icon: <span style={{ fontSize: 18 }}>🚀</span>,
                },
              ]}
            />
          </div>
        </div>

        <div
          style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 60px", background: "#fff", overflowY: "auto" }}
        >
          <div style={{ width: "100%", maxWidth: 440 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/login")}
              style={{ marginBottom: 20, padding: "4px 0", color: "#6b7280" }}
            >
              Quay lại đăng nhập
            </Button>

            <div style={{ marginBottom: 28 }}>
              <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>Đăng Ký Tài Khoản</Title>
              <Text type="secondary" style={{ fontSize: 14 }}>Tạo tài khoản mới để bắt đầu sử dụng hệ thống</Text>
            </div>

            <Card style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "none" }} styles={{ body: { padding: "28px 24px" } }}>
              <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
                <Form.Item
                  label={<Text style={{ fontWeight: 500 }}>Tên đăng nhập</Text>}
                  validateStatus={errors.username ? "error" : ""}
                  help={errors.username?.message}
                  style={{ marginBottom: 16 }}
                >
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
                        placeholder="Nhập tên đăng nhập"
                        size="large"
                        maxLength={50}
                        style={{ borderRadius: 10 }}
                      />
                    )}
                  />
                </Form.Item>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Form.Item
                    label={<Text style={{ fontWeight: 500 }}>Email</Text>}
                    validateStatus={errors.email ? "error" : ""}
                    help={errors.email?.message}
                    style={{ marginBottom: 16 }}
                  >
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                          placeholder="Nhập email"
                          type="email"
                          size="large"
                          maxLength={254}
                          style={{ borderRadius: 10 }}
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item label={<Text style={{ fontWeight: 500 }}>Số điện thoại</Text>} style={{ marginBottom: 16 }}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                          placeholder="Nhập số điện thoại"
                          size="large"
                          maxLength={15}
                          style={{ borderRadius: 10 }}
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<Text style={{ fontWeight: 500 }}>Họ và tên</Text>}
                  validateStatus={errors.full_name ? "error" : ""}
                  help={errors.full_name?.message}
                  style={{ marginBottom: 16 }}
                >
                  <Controller
                    name="full_name"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Nhập họ và tên đầy đủ" size="large" maxLength={100} style={{ borderRadius: 10 }} />
                    )}
                  />
                </Form.Item>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Form.Item
                    label={<Text style={{ fontWeight: 500 }}>Mật khẩu</Text>}
                    validateStatus={errors.password ? "error" : ""}
                    help={errors.password?.message}
                    style={{ marginBottom: 16 }}
                  >
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <Input.Password
                          {...field}
                          prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                          placeholder="Nhập mật khẩu"
                          size="large"
                          maxLength={128}
                          style={{ borderRadius: 10 }}
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    label={<Text style={{ fontWeight: 500 }}>Xác nhận mật khẩu</Text>}
                    validateStatus={errors.password_confirm ? "error" : ""}
                    help={errors.password_confirm?.message}
                    style={{ marginBottom: 16 }}
                  >
                    <Controller
                      name="password_confirm"
                      control={control}
                      render={({ field }) => (
                        <Input.Password
                          {...field}
                          prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                          placeholder="Xác nhận mật khẩu"
                          size="large"
                          maxLength={128}
                          style={{ borderRadius: 10 }}
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                <Form.Item label={<Text style={{ fontWeight: 500 }}>Vai trò</Text>} style={{ marginBottom: 20 }}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} size="large" style={{ borderRadius: 10 }}>
                        <Select.Option value="LANDLORD"><span>🏠 Chủ trọ</span></Select.Option>
                        <Select.Option value="TENANT"><span>👤 Người thuê</span></Select.Option>
                      </Select>
                    )}
                  />
                </Form.Item>

                {errors.root && (
                  <div style={{ padding: "10px 14px", background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: 8, marginBottom: 16 }}>
                    <Text style={{ color: "#cf1322", fontSize: 13 }}>{errors.root.message}</Text>
                  </div>
                )}

                <Form.Item style={{ marginBottom: 20 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={registerMutation.isPending}
                    style={{ borderRadius: 10, height: 48, fontWeight: 600, fontSize: 15 }}
                  >
                    {registerMutation.isPending ? "Đang tạo tài khoản..." : "Đăng Ký"}
                  </Button>
                </Form.Item>

                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Đã có tài khoản?{" "}
                    <Link to="/login" style={{ fontWeight: 600, color: "#1677ff" }}>Đăng nhập ngay</Link>
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