import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Tag, Card, Typography, Popconfirm, message, Input, Empty, Skeleton } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRooms, useDeleteRoom } from "@/application/hooks/useRooms";
import type { Room } from "@/domain/models/Room";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  AVAILABLE: "success",
  OCCUPIED: "processing",
  MAINTENANCE: "warning",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Còn trống",
  OCCUPIED: "Đã thuê",
  MAINTENANCE: "Bảo trì",
};

const statusIcons: Record<string, string> = {
  AVAILABLE: "🟢",
  OCCUPIED: "🔵",
  MAINTENANCE: "🟠",
};

export function RoomListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useRooms();
  const deleteMutation = useDeleteRoom();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Xóa phòng thành công");
    } catch {
      message.error("Xóa phòng thất bại");
    }
  };

  // Filter rooms by search text
  const filteredRooms = (data?.results || []).filter((room: Room) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      room.room_number?.toLowerCase().includes(search) ||
      room.landlord_name?.toLowerCase().includes(search) ||
      statusLabels[room.status]?.toLowerCase().includes(search)
    );
  });

  const columns: ColumnsType<Room> = [
    {
      title: "Số phòng",
      dataIndex: "room_number",
      key: "room_number",
      sorter: (a, b) => a.room_number.localeCompare(b.room_number),
      render: (value: string) => (
        <Text strong style={{ fontSize: 14 }}>{value}</Text>
      ),
    },
    {
      title: "Tầng",
      dataIndex: "floor",
      key: "floor",
      sorter: (a, b) => a.floor - b.floor,
      render: (value: number) => <Text>Tầng {value}</Text>,
    },
    {
      title: "Diện tích",
      dataIndex: "area",
      key: "area",
      sorter: (a, b) => a.area - b.area,
      render: (value: number) => <Text>{value} m²</Text>,
    },
    {
      title: "Giá cơ bản",
      dataIndex: "base_price",
      key: "base_price",
      sorter: (a, b) => Number(a.base_price) - Number(b.base_price),
      render: (value: string) => (
        <Text strong style={{ color: "#1677ff" }}>
          {Number(value).toLocaleString("vi-VN")} đ
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
          style={{
            borderRadius: 8,
            padding: "2px 12px",
            fontSize: 13,
          }}
        >
          {statusIcons[status]} {statusLabels[status] || status}
        </Tag>
      ),
      filters: [
        { text: "🟢 Còn trống", value: "AVAILABLE" },
        { text: "🔵 Đã thuê", value: "OCCUPIED" },
        { text: "🟠 Bảo trì", value: "MAINTENANCE" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Chủ trọ",
      dataIndex: "landlord_name",
      key: "landlord_name",
      render: (value: string) => <Text>{value || "-"}</Text>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_: unknown, record: Room) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/rooms/${record.id}/edit`)}
            style={{ color: "#1677ff" }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa phòng này? Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
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
              background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HomeOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Quản Lý Phòng Trọ</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          Quản lý danh sách phòng trọ, cập nhật trạng thái và thông tin phòng
        </Text>
      </div>

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
            placeholder="Tìm kiếm phòng..."
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
              onClick={() => navigate("/rooms/new")}
              style={{ borderRadius: 8, fontWeight: 500 }}
            >
              Thêm Phòng Mới
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
            dataSource={filteredRooms}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Chưa có phòng nào</Text>
                      <br />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/rooms/new")}
                        style={{ marginTop: 12, borderRadius: 8 }}
                      >
                        Thêm phòng đầu tiên
                      </Button>
                    </div>
                  }
                />
              ),
            }}
            pagination={{
              current: page,
              pageSize,
              total: filteredRooms.length,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} phòng`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            scroll={{ x: 800 }}
            style={{ borderRadius: 12, overflow: "hidden" }}
          />
        )}
      </Card>
    </div>
  );
}