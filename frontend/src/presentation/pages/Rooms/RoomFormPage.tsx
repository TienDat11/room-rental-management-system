import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Form, Input, InputNumber, Select, Button, Typography, message, Row, Col, Divider, Spin, Tag } from "antd";
import { SaveOutlined, ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { useRoom, useCreateRoom, useUpdateRoom } from "@/application/hooks/useRooms";
import { roomCreateSchema, type RoomCreateForm } from "@/domain/schemas/roomSchema";

const { Title, Text } = Typography;
const { TextArea } = Input;

export function RoomFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const roomId = id ? parseInt(id, 10) : 0;

  const { data: room, isLoading } = useRoom(roomId);
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();

  const { handleSubmit, control, reset, formState: { errors } } = useForm<RoomCreateForm>({
    resolver: zodResolver(roomCreateSchema),
    defaultValues: { room_number: "", floor: 1, area: 0, base_price: "0", amenities: "", description: "" },
  });

  useEffect(() => {
    if (room && isEdit) {
      reset({
        room_number: room.room_number,
        floor: room.floor,
        area: room.area,
        base_price: room.base_price,
        amenities: room.amenities || "",
        description: room.description || "",
      });
    }
  }, [room, reset, isEdit]);

  const onFinish = async (values: RoomCreateForm) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: roomId, data: values });
        message.success("Cập nhật phòng thành công!");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Tạo phòng thành công!");
      }
      navigate("/rooms");
    } catch {
      message.error(isEdit ? "Cập nhật phòng thất bại" : "Tạo phòng thất bại");
    }
  };

  if (isLoading && isEdit) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 100 }}>
        <Spin size="large" tip="Đang tải thông tin phòng..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/rooms")}
          style={{ marginBottom: 12, padding: "4px 0", color: "#6b7280" }}
        >
          Quay lại danh sách phòng
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: isEdit ? "linear-gradient(135deg, #fa8c16 0%, #d48806 100%)" : "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <HomeOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? "Chỉnh Sửa Phòng" : "Thêm Phòng Mới"}</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          {isEdit ? "Cập nhật thông tin chi tiết của phòng" : "Điền thông tin để tạo phòng mới"}
        </Text>
      </div>

      <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} styles={{ body: { padding: 32 } }}>
        <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
          <Title level={5} style={{ marginBottom: 20, color: "#1677ff" }}>📋 Thông tin cơ bản</Title>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Số phòng</Text>}
                required
                validateStatus={errors.room_number ? "error" : ""}
                help={errors.room_number?.message}
                style={{ marginBottom: 20 }}
              >
                <Controller
                  name="room_number"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ví dụ: 101, A201..." disabled={isEdit} size="large" maxLength={20} style={{ borderRadius: 10 }} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Tầng</Text>}
                required
                validateStatus={errors.floor ? "error" : ""}
                help={errors.floor?.message}
                style={{ marginBottom: 20 }}
              >
                <Controller
                  name="floor"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={1} max={100} style={{ width: "100%", borderRadius: 10 }} placeholder="Nhập số tầng" size="large" />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Diện tích (m²)</Text>}
                required
                validateStatus={errors.area ? "error" : ""}
                help={errors.area?.message}
                style={{ marginBottom: 20 }}
              >
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={1} max={999999} style={{ width: "100%", borderRadius: 10 }} placeholder="Nhập diện tích" size="large" />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={{ fontWeight: 500 }}>Giá cơ bản (VNĐ)</Text>}
                required
                validateStatus={errors.base_price ? "error" : ""}
                help={errors.base_price?.message}
                style={{ marginBottom: 20 }}
              >
                <Controller
                  name="base_price"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Nhập giá cơ bản" size="large" style={{ borderRadius: 10 }} />
                  )}
                />
              </Form.Item>
            </Col>
            {isEdit && room && (
              <Col xs={24} md={12}>
                <Form.Item label={<Text style={{ fontWeight: 500 }}>Trạng thái</Text>} style={{ marginBottom: 20 }}>
                  <Select defaultValue={room.status} size="large" style={{ borderRadius: 10 }}>
                    <Select.Option value="AVAILABLE"><Tag color="success" style={{ borderRadius: 6, margin: 0 }}>🟢 Còn trống</Tag></Select.Option>
                    <Select.Option value="OCCUPIED"><Tag color="processing" style={{ borderRadius: 6, margin: 0 }}>🔵 Đã thuê</Tag></Select.Option>
                    <Select.Option value="MAINTENANCE"><Tag color="warning" style={{ borderRadius: 6, margin: 0 }}>🟠 Bảo trì</Tag></Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          <Title level={5} style={{ marginBottom: 20, color: "#1677ff" }}>📝 Thông tin bổ sung</Title>

          <Form.Item label={<Text style={{ fontWeight: 500 }}>Tiện nghi</Text>} style={{ marginBottom: 20 }}>
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <TextArea {...field} rows={3} placeholder="Mô tả tiện nghi phòng (ví dụ: WiFi, điều hòa, nóng lạnh...)" maxLength={1000} showCount style={{ borderRadius: 10 }} />
              )}
            />
          </Form.Item>

          <Form.Item label={<Text style={{ fontWeight: 500 }}>Mô tả</Text>} style={{ marginBottom: 28 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea {...field} rows={3} placeholder="Mô tả thêm về phòng" maxLength={1000} showCount style={{ borderRadius: 10 }} />
              )}
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
            <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate("/rooms")} style={{ borderRadius: 10, minWidth: 120 }}>Hủy bỏ</Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ borderRadius: 10, minWidth: 160, fontWeight: 600 }}
            >
              {isEdit ? "Cập Nhật Phòng" : "Tạo Phòng Mới"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}