import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Form, Input, Button, Typography, message, Row, Col, Divider, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined, TeamOutlined, UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from "@ant-design/icons";
import { useTenant, useCreateTenant, useUpdateTenant } from "@/application/hooks/useTenants";
import { tenantCreateSchema, type TenantCreateForm } from "@/domain/schemas/tenantSchema";

const { Title, Text } = Typography;
const { TextArea } = Input;

export function TenantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const tenantId = id ? parseInt(id, 10) : 0;

  const { data: tenant, isLoading } = useTenant(tenantId);
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();

  const { handleSubmit, reset, formState: { errors } } = useForm<TenantCreateForm>({
    resolver: zodResolver(tenantCreateSchema),
    defaultValues: { full_name: "", id_card: "", phone: "", email: "", address: "", emergency_contact: "", notes: "" },
  });

  useEffect(() => {
    if (tenant && isEdit) {
      reset({
        full_name: tenant.full_name,
        id_card: tenant.id_card,
        phone: tenant.phone,
        email: tenant.email || "",
        date_of_birth: tenant.date_of_birth || "",
        address: tenant.address || "",
        emergency_contact: tenant.emergency_contact || "",
        notes: tenant.notes || "",
      });
    }
  }, [tenant, reset, isEdit]);

  const onFinish = async (values: TenantCreateForm) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: tenantId, data: values });
        message.success("Cập nhật người thuê thành công!");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Tạo người thuê thành công!");
      }
      navigate("/tenants");
    } catch {
      message.error(isEdit ? "Cập nhật thất bại" : "Tạo người thuê thất bại");
    }
  };

  if (isLoading && isEdit) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 100 }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/tenants")}
          style={{ marginBottom: 12, padding: "4px 0", color: "#6b7280" }}
        >
          Quay lại danh sách người thuê
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isEdit
                ? "linear-gradient(135deg, #fa8c16 0%, #d48806 100%)"
                : "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TeamOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? "Chỉnh Sửa Người Thuê" : "Thêm Người Thuê Mới"}
          </Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          {isEdit ? "Cập nhật thông tin chi tiết của người thuê" : "Điền thông tin để tạo người thuê mới"}
        </Text>
      </div>

      {/* Form Card */}
      <Card
        style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        styles={{ body: { padding: 32 } }}
      >
        <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
          {/* Personal Info */}
          <Title level={5} style={{ marginBottom: 20, color: "#722ed1" }}>
            👤 Thông tin cá nhân
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Họ và tên</Text>}
                required
                validateStatus={errors.full_name ? "error" : ""}
                help={errors.full_name?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Nhập họ và tên đầy đủ"
                  size="large"
                  maxLength={100}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>CMND/CCCD</Text>}
                required
                validateStatus={errors.id_card ? "error" : ""}
                help={errors.id_card?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Nhập số CMND/CCCD"
                  size="large"
                  maxLength={20}
                  style={{ borderRadius: 10, fontFamily: "monospace" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Số điện thoại</Text>}
                required
                validateStatus={errors.phone ? "error" : ""}
                help={errors.phone?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                  maxLength={15}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Email</Text>}
                validateStatus={errors.email ? "error" : ""}
                help={errors.email?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Nhập email"
                  type="email"
                  size="large"
                  maxLength={254}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Địa chỉ</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  prefix={<HomeOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Nhập địa chỉ thường trú"
                  size="large"
                  maxLength={255}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Liên hệ khẩn cấp</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Số điện thoại người thân"
                  size="large"
                  maxLength={100}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          {/* Additional Info */}
          <Title level={5} style={{ marginBottom: 20, color: "#722ed1" }}>
            📝 Thông tin bổ sung
          </Title>

          <Form.Item
            label={<Text style={{ fontWeight: 500 }}>Ghi chú</Text>}
            style={{ marginBottom: 28 }}
          >
            <TextArea
              rows={3}
              placeholder="Ghi chú thêm về người thuê"
              maxLength={1000}
              showCount
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/tenants")}
              style={{ borderRadius: 10, minWidth: 120 }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ borderRadius: 10, minWidth: 180, fontWeight: 600, background: "#722ed1", borderColor: "#722ed1" }}
            >
              {isEdit ? "Cập Nhật Người Thuê" : "Tạo Người Thuê Mới"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}