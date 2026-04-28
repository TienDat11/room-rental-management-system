import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Tag, Card, Typography, Popconfirm, message, Input, Empty, Skeleton } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileTextOutlined, ReloadOutlined } from "@ant-design/icons";
import { useContracts, useDeleteContract } from "@/application/hooks/useContracts";
import type { Contract } from "@/domain/models/Contract";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  EXPIRED: "warning",
  TERMINATED: "error",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Hiệu lực",
  EXPIRED: "Hết hạn",
  TERMINATED: "Đã chấm dứt",
};

const statusIcons: Record<string, string> = {
  ACTIVE: "🟢",
  EXPIRED: "🟡",
  TERMINATED: "🔴",
};

export function ContractListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useContracts();
  const deleteMutation = useDeleteContract();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Xóa hợp đồng thành công");
    } catch {
      message.error("Xóa hợp đồng thất bại");
    }
  };

  // Filter contracts by search text
  const filteredContracts = (data?.results || []).filter((contract: Contract) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      contract.room_number?.toLowerCase().includes(search) ||
      contract.tenant_name?.toLowerCase().includes(search) ||
      statusLabels[contract.status]?.toLowerCase().includes(search)
    );
  });

  const columns: ColumnsType<Contract> = [
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
      title: "Ngày bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (value: string) => (
        <Text style={{ fontSize: 13 }}>{value ? new Date(value).toLocaleDateString("vi-VN") : "-"}</Text>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      render: (value: string) => (
        <Text style={{ fontSize: 13 }}>{value ? new Date(value).toLocaleDateString("vi-VN") : "-"}</Text>
      ),
    },
    {
      title: "Tiền thuê/tháng",
      dataIndex: "monthly_rent",
      key: "monthly_rent",
      sorter: (a, b) => Number(a.monthly_rent) - Number(b.monthly_rent),
      render: (v: string) => (
        <Text strong style={{ color: "#1677ff" }}>
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
        { text: "🟢 Hiệu lực", value: "ACTIVE" },
        { text: "🟡 Hết hạn", value: "EXPIRED" },
        { text: "🔴 Đã chấm dứt", value: "TERMINATED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_: unknown, record: Contract) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/contracts/${record.id}/edit`)}
            style={{ color: "#1677ff" }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa hợp đồng này?"
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
              background: "linear-gradient(135deg, #13c2c2 0%, #08979c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Quản Lý Hợp Đồng</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          Quản lý hợp đồng thuê phòng và theo dõi tình trạng hiệu lực
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
            placeholder="Tìm kiếm hợp đồng..."
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
              onClick={() => navigate("/contracts/new")}
              style={{ borderRadius: 8, fontWeight: 500, background: "#13c2c2", borderColor: "#13c2c2" }}
            >
              Tạo Hợp Đồng
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
            dataSource={filteredContracts}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Chưa có hợp đồng nào</Text>
                      <br />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/contracts/new")}
                        style={{ marginTop: 12, borderRadius: 8, background: "#13c2c2", borderColor: "#13c2c2" }}
                      >
                        Tạo hợp đồng đầu tiên
                      </Button>
                    </div>
                  }
                />
              ),
            }}
            pagination={{
              current: page,
              pageSize,
              total: filteredContracts.length,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hợp đồng`,
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