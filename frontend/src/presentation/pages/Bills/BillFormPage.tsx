import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Form, Input, Select, Button, Typography, message, Row, Col, Divider, InputNumber } from "antd";
import { SaveOutlined, ArrowLeftOutlined, DollarOutlined, HomeOutlined, TeamOutlined, FileTextOutlined, ThunderboltOutlined, DropboxOutlined } from "@ant-design/icons";
import { useCreateBill } from "@/application/hooks/useBills";
import { useRooms } from "@/application/hooks/useRooms";
import { useTenants } from "@/application/hooks/useTenants";
import { useContracts } from "@/application/hooks/useContracts";
import { billCreateSchema, type BillCreateForm } from "@/domain/schemas/billSchema";
import type { Room } from "@/domain/models/Room";
import type { Tenant } from "@/domain/models/Tenant";
import type { Contract } from "@/domain/models/Contract";

const { Title, Text } = Typography;

export function BillFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreateBill();
  const { data: roomsData } = useRooms();
  const { data: tenantsData } = useTenants();
  const { data: contractsData } = useContracts();

  const { handleSubmit, formState: { errors } } = useForm<BillCreateForm>({
    resolver: zodResolver(billCreateSchema),
    defaultValues: { bill_month: new Date().getMonth() + 1, bill_year: new Date().getFullYear() },
  });

  const onFinish = async (values: BillCreateForm) => {
    try {
      await createMutation.mutateAsync(values);
      message.success("Tạo hóa đơn thành công!");
      navigate("/bills");
    } catch {
      message.error("Tạo hóa đơn thất bại");
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/bills")}
          style={{ marginBottom: 12, padding: "4px 0", color: "#6b7280" }}
        >
          Quay lại danh sách hóa đơn
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DollarOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Tạo Hóa Đơn Mới</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          Tạo hóa đơn tiền phòng, điện nước cho người thuê
        </Text>
      </div>

      {/* Form Card */}
      <Card
        style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        styles={{ body: { padding: 32 } }}
      >
        <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
          {/* Bill Info */}
          <Title level={5} style={{ marginBottom: 20, color: "#eb2f96" }}>
            📋 Thông tin hóa đơn
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={8}>
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
                      {r.room_number}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
                      {t.full_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}><FileTextOutlined /> Hợp đồng</Text>}
                required
                validateStatus={errors.contract ? "error" : ""}
                help={errors.contract?.message}
                style={{ marginBottom: 20 }}
              >
                <Select
                  placeholder="Chọn hợp đồng"
                  size="large"
                  style={{ borderRadius: 10 }}
                  showSearch
                  optionFilterProp="children"
                >
                  {contractsData?.results?.map((c: Contract) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.room_number} - {c.tenant_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Giá phòng (VNĐ)</Text>}
                required
                validateStatus={errors.room_price ? "error" : ""}
                help={errors.room_price?.message}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Nhập giá phòng"
                  size="large"
                  maxLength={50}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Tháng</Text>}
                validateStatus={errors.bill_month ? "error" : ""}
                help={errors.bill_month?.message}
                style={{ marginBottom: 20 }}
              >
                <InputNumber
                  min={1}
                  max={12}
                  placeholder="Tháng"
                  size="large"
                  style={{ width: "100%", borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Năm</Text>}
                validateStatus={errors.bill_year ? "error" : ""}
                help={errors.bill_year?.message}
                style={{ marginBottom: 20 }}
              >
                <InputNumber
                  min={2000}
                  max={2100}
                  placeholder="Năm"
                  size="large"
                  style={{ width: "100%", borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          {/* Electricity */}
          <Title level={5} style={{ marginBottom: 20, color: "#eb2f96" }}>
            <ThunderboltOutlined style={{ marginRight: 8 }} />
            Chỉ số điện
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Chỉ số cũ (kWh)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Chỉ số điện cũ"
                  size="large"
                  maxLength={20}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Chỉ số mới (kWh)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Chỉ số điện mới"
                  size="large"
                  maxLength={20}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Đơn giá (đ/kWh)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Đơn giá điện"
                  size="large"
                  maxLength={20}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          {/* Water */}
          <Title level={5} style={{ marginBottom: 20, color: "#eb2f96" }}>
            <DropboxOutlined style={{ marginRight: 8 }} />
            Chỉ số nước
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Chỉ số cũ (m³)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Chỉ số nước cũ"
                  size="large"
                  maxLength={20}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Chỉ số mới (m³)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Chỉ số nước mới"
                  size="large"
                  maxLength={20}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Đơn giá (đ/m³)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Đơn giá nước"
                  size="large"
                  maxLength={20}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          {/* Additional */}
          <Title level={5} style={{ marginBottom: 20, color: "#eb2f96" }}>
            📝 Thông tin bổ sung
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Phí khác (VNĐ)</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Nhập phí khác"
                  size="large"
                  maxLength={50}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Mô tả phí khác</Text>}
                style={{ marginBottom: 20 }}
              >
                <Input
                  placeholder="Mô tả các khoản phí khác"
                  size="large"
                  maxLength={255}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Hạn thanh toán</Text>}
                required
                validateStatus={errors.due_date ? "error" : ""}
                help={errors.due_date?.message}
                style={{ marginBottom: 28 }}
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
                label={<Text style={{ fontWeight: 500 }}>Ghi chú</Text>}
                style={{ marginBottom: 28 }}
              >
                <Input.TextArea
                  rows={1}
                  placeholder="Ghi chú thêm"
                  maxLength={1000}
                  showCount
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

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
              onClick={() => navigate("/bills")}
              style={{ borderRadius: 10, minWidth: 120 }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={createMutation.isPending}
              style={{ borderRadius: 10, minWidth: 180, fontWeight: 600, background: "#eb2f96", borderColor: "#eb2f96" }}
            >
              Tạo Hóa Đơn
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}