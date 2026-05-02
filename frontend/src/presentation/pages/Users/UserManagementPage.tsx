import { useState } from "react";
import { Button, Card, Empty, Form, Input, message, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/application/hooks/useUsers";
import type { User, UserCreateRequest, UserUpdateRequest, UserRole } from "@/domain/models/User";

const { Title, Text } = Typography;

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  LANDLORD: "Chủ trọ",
  TENANT: "Người thuê",
};

const roleColors: Record<UserRole, string> = {
  ADMIN: "red",
  LANDLORD: "blue",
  TENANT: "green",
};

type UserFormValues = UserCreateRequest & { is_active: boolean };

export function UserManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const { data, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: "TENANT", is_active: true });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      password: "",
      password_confirm: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingUser) {
        const payload: UserUpdateRequest = {
          email: values.email,
          full_name: values.full_name,
          phone: values.phone,
          role: values.role,
          is_active: values.is_active,
        };
        await updateMutation.mutateAsync({ id: editingUser.id, data: payload });
        message.success("Cập nhật tài khoản thành công");
      } else {
        const payload: UserCreateRequest = {
          username: values.username,
          email: values.email,
          password: values.password,
          password_confirm: values.password_confirm,
          full_name: values.full_name,
          phone: values.phone,
          role: values.role,
        };
        await createMutation.mutateAsync(payload);
        message.success("Tạo tài khoản thành công");
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      message.error(editingUser ? "Cập nhật tài khoản thất bại" : "Tạo tài khoản thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Đã khóa tài khoản");
    } catch {
      message.error("Khóa tài khoản thất bại");
    }
  };

  const users = (data?.results || []).filter((user) => {
    const search = searchText.toLowerCase();
    return (
      !search ||
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.full_name?.toLowerCase().includes(search) ||
      roleLabels[user.role].toLowerCase().includes(search)
    );
  });

  const columns: ColumnsType<User> = [
    {
      title: "Tài khoản",
      key: "identity",
      render: (_, user) => (
        <div>
          <Text strong>{user.username}</Text>
          <br />
          <Text type="secondary">{user.full_name || user.email}</Text>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "-",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Đang hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, user) => (
        <Space size={4}>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(user)}>
            Sửa
          </Button>
          {user.is_active && (
            <Popconfirm
              title="Khóa tài khoản"
              description="Tài khoản sẽ không thể đăng nhập sau khi bị khóa."
              onConfirm={() => handleDelete(user.id)}
              okText="Khóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                Khóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #cf1322 0%, #820014 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Quản Lý Tài Khoản</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 52 }}>
          Tạo, cập nhật và khóa tài khoản người dùng trong hệ thống
        </Text>
      </div>

      <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} styles={{ body: { padding: 24 } }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <Input
            placeholder="Tìm kiếm tài khoản..."
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: 300, borderRadius: 10 }}
            allowClear
          />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => setSearchText("")} style={{ borderRadius: 8 }}>
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
              Thêm Tài Khoản
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tài khoản" /> }}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} tài khoản` }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={editingUser ? "Cập nhật tài khoản" : "Thêm tài khoản"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingUser ? "Cập nhật" : "Tạo tài khoản"}
        cancelText="Hủy"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editingUser && (
            <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Nhập tên đăng nhập" }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Nhập email hợp lệ" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="full_name" label="Họ và tên">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Chọn vai trò" }]}>
            <Select
              options={[
                { value: "ADMIN", label: "Quản trị viên" },
                { value: "LANDLORD", label: "Chủ trọ" },
                { value: "TENANT", label: "Người thuê" },
              ]}
            />
          </Form.Item>
          {!editingUser && (
            <>
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="password_confirm"
                label="Xác nhận mật khẩu"
                rules={[{ required: true, message: "Nhập lại mật khẩu" }]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
