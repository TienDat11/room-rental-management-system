import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Tag, Card, Typography, Popconfirm, message, Modal, Form, Input, DatePicker, Select, Row, Col, Empty, Skeleton } from "antd";
import { PlusOutlined, DeleteOutlined, DollarOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useBills, useDeleteBill, usePayBill } from "@/application/hooks/useBills";
import type { Bill, PaymentCreate } from "@/domain/models/Bill";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "error",
};

const statusLabels: Record<string, string> = {
  PENDING: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
};

const statusIcons: Record<string, string> = {
  PENDING: "🟡",
  PAID: "🟢",
  OVERDUE: "🔴",
};

export function BillListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [payForm] = Form.useForm();
  const { data, isLoading } = useBills();
  const deleteMutation = useDeleteBill();
  const payMutation = usePayBill();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Xóa hóa đơn thành công");
    } catch {
      message.error("Xóa hóa đơn thất bại");
    }
  };

  const openPayModal = (bill: Bill) => {
    setSelectedBill(bill);
    payForm.setFieldsValue({ amount: bill.total_amount, payment_date: dayjs() });
    setPayModalOpen(true);
  };

  const handlePay = async () => {
    if (!selectedBill) return;
    try {
      const values = await payForm.validateFields();
      const paymentData: PaymentCreate = {
        amount: values.amount,
        payment_method: values.payment_method,
        payment_date: values.payment_date.format("YYYY-MM-DD"),
        notes: values.notes || "",
      };
      await payMutation.mutateAsync({ id: selectedBill.id, data: paymentData });
      message.success("Thanh toán thành công!");
      setPayModalOpen(false);
      payForm.resetFields();
    } catch {
      message.error("Thanh toán thất bại");
    }
  };

  // Filter bills by search text
  const filteredBills = (data?.results || []).filter((bill: Bill) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      bill.room_number?.toLowerCase().includes(search) ||
      bill.tenant_name?.toLowerCase().includes(search) ||
      statusLabels[bill.status]?.toLowerCase().includes(search)
    );
  });

  // Stats
  const totalPending = (data?.results || []).filter((b: Bill) => b.status === "PENDING").length;
  const totalOverdue = (data?.results || []).filter((b: Bill) => b.status === "OVERDUE").length;
  const totalPaid = (data?.results || []).filter((b: Bill) => b.status === "PAID").length;

  const columns: ColumnsType<Bill> = [
    {
      title: "Phòng",
      dataIndex: "room_number",
      key: "room_number",
      sorter: (a, b) => a.room_number.localeCompare(b.room_number),
      render: (value: string) => <Text strong style={{ fontSize: 14 }}>{value}</Text>,
    },
    {
      title: "Người thuê",
      dataIndex: "tenant_name",
      key: "tenant_name",
      render: (value: string) => <Text>{value}</Text>,
    },
    {
      title: "Kỳ hạn",
      key: "period",
      render: (_: unknown, record: Bill) => (
        <Tag style={{ borderRadius: 6 }}>Tháng {record.bill_month}/{record.bill_year}</Tag>
      ),
    },
    {
      title: "Tiền phòng",
      dataIndex: "room_price",
      key: "room_price",
      render: (v: string) => <Text>{Number(v).toLocaleString("vi-VN")} đ</Text>,
    },
    {
      title: "Tiền điện",
      dataIndex: "electricity_cost",
      key: "electricity_cost",
      render: (v: string) => <Text>{Number(v).toLocaleString("vi-VN")} đ</Text>,
    },
    {
      title: "Tiền nước",
      dataIndex: "water_cost",
      key: "water_cost",
      render: (v: string) => <Text>{Number(v).toLocaleString("vi-VN")} đ</Text>,
    },
    {
      title: "Tổng cộng",
      dataIndex: "total_amount",
      key: "total_amount",
      sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount),
      render: (v: string) => (
        <Text strong style={{ color: "#1677ff", fontSize: 14 }}>
          {Number(v).toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={statusColors[status]}
          style={{ borderRadius: 8, padding: "2px 12px", fontSize: 13 }}
        >
          {statusIcons[status]} {statusLabels[status] || status}
        </Tag>
      ),
      filters: [
        { text: "🟡 Chưa thanh toán", value: "PENDING" },
        { text: "🟢 Đã thanh toán", value: "PAID" },
        { text: "🔴 Quá hạn", value: "OVERDUE" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "due_date",
      key: "due_date",
      render: (value: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {value ? new Date(value).toLocaleDateString("vi-VN") : "-"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_: unknown, record: Bill) => (
        <Space size={4}>
          {record.status === "PENDING" && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => openPayModal(record)}
              style={{ borderRadius: 6, background: "#52c41a", borderColor: "#52c41a" }}
            >
              Thanh toán
            </Button>
          )}
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa hóa đơn này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
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
          <Title level={3} style={{ margin: 0 }}>Quản Lý Hóa Đơn</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          Quản lý hóa đơn tiền phòng, điện nước và theo dõi thanh toán
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={8}>
          <Card
            style={{ borderRadius: 12, border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#fff7e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ClockCircleOutlined style={{ color: "#fa8c16", fontSize: 18 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Chờ thanh toán</Text>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fa8c16" }}>{totalPending}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card
            style={{ borderRadius: 12, border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#fff1f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WarningOutlined style={{ color: "#ff4d4f", fontSize: 18 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Quá hạn</Text>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#ff4d4f" }}>{totalOverdue}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card
            style={{ borderRadius: 12, border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#f6ffed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Đã thanh toán</Text>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#52c41a" }}>{totalPaid}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Card with Table */}
      <Card
        style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        styles={{ body: { padding: 24 } }}
      >
        {/* Search & Actions Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Input
            placeholder="Tìm kiếm hóa đơn..."
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 10 }}
            allowClear
          />
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setSearchText("")}
              style={{ borderRadius: 8 }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/bills/new")}
              style={{ borderRadius: 8, fontWeight: 500, background: "#eb2f96", borderColor: "#eb2f96" }}
            >
              Tạo Hóa Đơn
            </Button>
          </Space>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: "20px 0" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} active paragraph={{ rows: 1 }} style={{ marginBottom: 16 }} />
            ))}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredBills}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Chưa có hóa đơn nào</Text>
                      <br />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/bills/new")}
                        style={{ marginTop: 12, borderRadius: 8, background: "#eb2f96", borderColor: "#eb2f96" }}
                      >
                        Tạo hóa đơn đầu tiên
                      </Button>
                    </div>
                  }
                />
              ),
            }}
            pagination={{
              current: page,
              pageSize,
              total: filteredBills.length,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hóa đơn`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            scroll={{ x: 1100 }}
            style={{ borderRadius: 12, overflow: "hidden" }}
          />
        )}
      </Card>

      {/* Payment Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#f6ffed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarOutlined style={{ color: "#52c41a" }} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Thanh toán hóa đơn</div>
              <Text type="secondary" style={{ fontSize: 13 }}>Phòng {selectedBill?.room_number || ""}</Text>
            </div>
          </div>
        }
        open={payModalOpen}
        onOk={handlePay}
        onCancel={() => {
          setPayModalOpen(false);
          payForm.resetFields();
        }}
        confirmLoading={payMutation.isPending}
        okText="Xác nhận thanh toán"
        cancelText="Hủy bỏ"
        okButtonProps={{
          style: { borderRadius: 8, background: "#52c41a", borderColor: "#52c41a", fontWeight: 600 },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        width={500}
      >
        <div style={{ padding: "16px 0" }}>
          <Form form={payForm} layout="vertical">
            <Form.Item
              label={<Text style={{ fontWeight: 500 }}>Số tiền</Text>}
              name="amount"
              rules={[{ required: true, message: "Nhập số tiền" }]}
            >
              <Input
                type="number"
                size="large"
                style={{ borderRadius: 10 }}
                prefix={<Text type="secondary">VNĐ</Text>}
              />
            </Form.Item>
            <Form.Item
              label={<Text style={{ fontWeight: 500 }}>Phương thức thanh toán</Text>}
              name="payment_method"
              rules={[{ required: true, message: "Chọn phương thức" }]}
              initialValue="CASH"
            >
              <Select size="large" style={{ borderRadius: 10 }}>
                <Select.Option value="CASH">💵 Tiền mặt</Select.Option>
                <Select.Option value="TRANSFER">🏦 Chuyển khoản</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={<Text style={{ fontWeight: 500 }}>Ngày thanh toán</Text>}
              name="payment_date"
              rules={[{ required: true, message: "Chọn ngày thanh toán" }]}
            >
              <DatePicker
                style={{ width: "100%", borderRadius: 10 }}
                format="DD/MM/YYYY"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label={<Text style={{ fontWeight: 500 }}>Ghi chú</Text>}
              name="notes"
            >
              <Input.TextArea rows={2} style={{ borderRadius: 10 }} placeholder="Ghi chú thêm (nếu có)" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}