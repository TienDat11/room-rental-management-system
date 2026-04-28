import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Form, Input, Select, Button, Space, Typography, message, Row, Col, Divider, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined, FileTextOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import { useContract, useCreateContract, useUpdateContract } from "@/application/hooks/useContracts";
import { useRooms } from "@/application/hooks/useRooms";
import { useTenants } from "@/application/hooks/useTenants";
import { contractCreateSchema, type ContractCreateForm } from "@/domain/schemas/contractSchema";
import type { Room } from "@/domain/models/Room";
import type { Tenant } from "@/domain/models/Tenant";

const { Title, Text } = Typography;
const { TextArea } = Input;

export function ContractFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const contractId = id ? parseInt(id, 10) : 0;

  const { data: contract, isLoading } = useContract(contractId);
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const { data: roomsData } = useRooms();
  const { data: tenantsData } = useTenants();

  const { handleSubmit, reset, formState: { errors } } = useForm<ContractCreateForm>({
    resolver: zodResolver(contractCreateSchema),
  });

  useEffect(() => {
    if (contract && isEdit) {
      reset({
        tenant: contract.tenant,
        room: contract.room,
        start_date: contract.start_date,
        end_date: contract.end_date,
        deposit_amount: contract.deposit_amount || "",
        monthly_rent: contract.monthly_rent,
        terms: contract.terms || "",
        notes: contract.notes || "",
      });
    }
  }, [contract, reset, isEdit]);

  const onFinish = async (values: ContractCreateForm) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: contractId, data: values });
        message.success("Cập nhật hợp đồng thành công!");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Tạo hợp đồng thành công!");
      }
      navigate("/contracts");
    } catch {
      message.error(isEdit ? "Cập nhật thất bại" : "Tạo hợp đồng thất bại");
    }
  };

  if (isLoading && isEdit) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 100 }}>
        <Spin size="large" tip="Đang tải thông tin hợp đồng..." />
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
          onClick={() => navigate("/contracts")}
          style={{ marginBottom: 12, padding: "4px 0", color: "#6b7280" }}
        >
          Quay lại danh sách hợp đồng
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isEdit
                ? "linear-gradient(135deg, #fa8c16 0%, #d48806 100%)"
                : "linear-gradient(135deg, #13c2c2 0%, #08979c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? "Chỉnh Sửa Hợp Đồng" : "Tạo Hợp Đồng Mới"}
          </Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          {isEdit ? "Cập nhật thông tin hợp đồng thuê phòng" : "Tạo hợp đồng thuê phòng mới"}
        </Text>
      </div>

      {/* Form Card */}
      <Card
        style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        styles={{ body: { padding: 32 } }}
      >
        <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
          {/* Contract Parties */}
          <Title level={5} style={{ marginBottom: 20, color: "#13c2c2" }}>
            🤝 Bên thuê & Phòng
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}><HomeOutlined /> Phòng</Text>}
                required
                validateStatus={errors.room ? "error" : ""}
                help={errors.room?.message}
                style={{ marginBottom: 20 }}
              >
                <Select
                  placeholder="Chọn phòng"
                  size="large"
                  style={{ borderRadius: 10 }}
                  showSearch
                  optionFilterProp="children"
                >
                  {roomsData?.results?.map((r: Room) => (
                    <Select.Option key={r.id} value={r.id}>
                      <Space>
                        <HomeOutlined />
                        {r.room_number} - {r.status_display || r.status}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}><TeamOutlined /> Người thuê</Text>}
                required
                validateStatus={errors.tenant ? "error" : ""}
                help={errors.tenant?.message}
                style={{ marginBottom: 20 }}
              >
                <Select
                  placeholder="Chọn người thuê"
                  size="large"
                  style={{ borderRadius: 10 }}
                  showSearch
                  optionFilterProp="children"
                >
                  {tenantsData?.results?.map((t: Tenant) => (
                    <Select.Option key={t.id} value={t.id}>
                      <Space>
                        <TeamOutlined />
                        {t.full_name} - {t.phone}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          {/* Contract Details */}
          <Title level={5} style={{ marginBottom: 20, color: "#13c2c2" }}>
            📅 Chi tiết hợp đồng
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Ngày bắt đầu</Text>}
                required
                validateStatus={errors.start_date ? "error" : ""}
                help={errors.start_date?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  type="date"
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Ngày kết thúc</Text>}
                required
                validateStatus={errors.end_date ? "error" : ""}
                help={errors.end_date?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  type="date"
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Tiền thuê/tháng (VNĐ)</Text>}
                required
                validateStatus={errors.monthly_rent ? "error" : ""}
                help={errors.monthly_rent?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Nhập tiền thuê hàng tháng"
                  size="large"
                  maxLength={50}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Tiền cọc (VNĐ)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Nhập tiền cọc (nếu có)"
                  size="large"
                  maxLength={50}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          {/* Additional Info */}
          <Title level={5} style={{ marginBottom: 20, color: "#13c2c2" }}>
            📝 Điều khoản & Ghi chú
          </Title>

          <Form.Item
            label={<Text style={{ fontWeight: 500 }}>Điều khoản hợp đồng</Text>}
            style={{ marginBottom: 20 }}
          >
            <TextArea
              rows={4}
              placeholder="Nhập các điều khoản của hợp đồng"
              maxLength={2000}
              showCount
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ fontWeight: 500 }}>Ghi chú</Text>}
            style={{ marginBottom: 28 }}
          >
            <TextArea
              rows={2}
              placeholder="Ghi chú thêm về hợp đồng"
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
              onClick={() => navigate("/contracts")}
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
              style={{ borderRadius: 10, minWidth: 180, fontWeight: 600, background: "#13c2c2", borderColor: "#13c2c2" }}
            >
              {isEdit ? "Cập Nhật Hợp Đồng" : "Tạo Hợp Đồng Mới"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}