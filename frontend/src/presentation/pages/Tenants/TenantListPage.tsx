import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Tag, Card, Typography, Popconfirm, message, Input, Empty, Skeleton } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TeamOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTenants, useDeleteTenant } from "@/application/hooks/useTenants";
import { useAuthStore } from "@/application/stores/authStore";
import type { Tenant } from "@/domain/models/Tenant";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

export function TenantListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useTenants();
  const { user } = useAuthStore();
  const deleteMutation = useDeleteTenant();
  const canManage = user?.role === "ADMIN" || user?.role === "LANDLORD";

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Xóa người thuê thành công");
    } catch {
      message.error("Xóa người thuê thất bại");
    }
  };

  // Filter tenants by search text
  const filteredTenants = (data?.results || []).filter((tenant: Tenant) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      tenant.full_name?.toLowerCase().includes(search) ||
      tenant.id_card?.toLowerCase().includes(search) ||
      tenant.phone?.includes(search) ||
      tenant.email?.toLowerCase().includes(search) ||
      tenant.room_number?.toLowerCase().includes(search)
    );
  });

  const columns: ColumnsType<Tenant> = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      render: (value: string) => <Text strong style={{ fontSize: 14 }}>{value}</Text>,
    },
    {
      title: "CMND/CCCD",
      dataIndex: "id_card",
      key: "id_card",
      render: (value: string) => <Text style={{ fontFamily: "monospace" }}>{value}</Text>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (value: string) => <Text style={{ color: "#1677ff" }}>{value}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value: string) => <Text type="secondary">{value || "-"}</Text>,
    },
    {
      title: "Phòng đang thuê",
      dataIndex: "room_number",
      key: "room_number",
      render: (val: string | null) => (
        <Tag color={val ? "processing" : "default"} style={{ borderRadius: 8 }}>
          {val || "Chưa có phòng"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={status === "ACTIVE" ? "success" : "error"}
          style={{ borderRadius: 8, padding: "2px 12px" }}
        >
          {status === "ACTIVE" ? "🟢 Hoạt động" : "🔴 Ngừng"}
        </Tag>
      ),
      filters: [
        { text: "🟢 Hoạt động", value: "ACTIVE" },
        { text: "🔴 Ngừng hoạt động", value: "INACTIVE" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_: unknown, record: Tenant) => (
        canManage ? (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/tenants/${record.id}/edit`)}
            style={{ color: "#1677ff" }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa người thuê này?"
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
        ) : (
          <Text type="secondary">Chỉ xem</Text>
        )
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
              background: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TeamOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Quản Lý Người Thuê</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          Quản lý thông tin người thuê và phân bổ phòng
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
            placeholder="Tìm kiếm người thuê..."
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
            {canManage && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/tenants/new")}
                style={{ borderRadius: 8, fontWeight: 500, background: "#722ed1", borderColor: "#722ed1" }}
              >
                Thêm Người Thuê
              </Button>
            )}
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
            dataSource={filteredTenants}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Chưa có người thuê nào</Text>
                      <br />
                      {canManage && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => navigate("/tenants/new")}
                          style={{ marginTop: 12, borderRadius: 8, background: "#722ed1", borderColor: "#722ed1" }}
                        >
                          Thêm người thuê đầu tiên
                        </Button>
                      )}
                    </div>
                  }
                />
              ),
            }}
            pagination={{
              current: page,
              pageSize,
              total: filteredTenants.length,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} người thuê`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            scroll={{ x: 900 }}
            style={{ borderRadius: 12, overflow: "hidden" }}
          />
        )}
      </Card>
    </div>
  );
}
