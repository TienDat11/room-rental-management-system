import { useState } from "react";
import type React from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Typography, Avatar, Dropdown, Breadcrumb, Badge, Space, theme as antdTheme } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  SettingOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/application/stores/authStore";
import type { UserRole } from "@/domain/models/User";

const { Sider, Content, Header, Footer } = Layout;
const { Title, Text } = Typography;
const { useToken } = antdTheme;

const menuByRole: Record<UserRole, { key: string; icon: React.ReactNode; label: string }[]> = {
  ADMIN: [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/users", icon: <SolutionOutlined />, label: "Tài khoản" },
    { key: "/rooms", icon: <HomeOutlined />, label: "Phòng" },
    { key: "/tenants", icon: <TeamOutlined />, label: "Người thuê" },
    { key: "/contracts", icon: <FileTextOutlined />, label: "Hợp đồng" },
    { key: "/bills", icon: <DollarOutlined />, label: "Hóa đơn" },
  ],
  LANDLORD: [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/rooms", icon: <HomeOutlined />, label: "Quản lý phòng" },
    { key: "/tenants", icon: <TeamOutlined />, label: "Người thuê" },
    { key: "/contracts", icon: <FileTextOutlined />, label: "Hợp đồng" },
    { key: "/bills", icon: <DollarOutlined />, label: "Hóa đơn" },
  ],
  TENANT: [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/rooms", icon: <HomeOutlined />, label: "Phòng của tôi" },
    { key: "/tenants", icon: <TeamOutlined />, label: "Thông tin thuê" },
    { key: "/contracts", icon: <FileTextOutlined />, label: "Hợp đồng của tôi" },
    { key: "/bills", icon: <DollarOutlined />, label: "Hóa đơn của tôi" },
  ],
};

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/rooms": "Quản lý phòng trọ",
  "/tenants": "Quản lý người thuê",
  "/contracts": "Quản lý hợp đồng",
  "/bills": "Quản lý hóa đơn",
  "/users": "Quản lý tài khoản",
};

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useToken();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      handleLogout();
    }
  };

  // Get current page title for breadcrumb
  const currentPath = location.pathname.split("/").slice(0, 2).join("/") || "/";
  const pageTitle = pageTitles[currentPath] || "Dashboard";
  const menuItems = user ? menuByRole[user.role] : [];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        collapsedWidth={80}
        collapsed={collapsed}
        style={{
          background: "linear-gradient(180deg, #001529 0%, #002140 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease",
        }}
        trigger={null}
      >
        {/* Logo Area */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0 16px" : "0 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: collapsed ? 0 : 12,
              boxShadow: "0 2px 8px rgba(22,119,255,0.3)",
            }}
          >
            <HomeOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          {!collapsed && (
            <div>
              <Title level={5} style={{ color: "#fff", margin: 0, fontSize: 15 }}>
                Phòng Trọ
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
                Quản lý thông minh
              </Text>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "transparent",
            border: "none",
            marginTop: 8,
          }}
          theme="dark"
        />

        {/* User Info at Bottom */}
        {!collapsed && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px 24px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <Space size={12}>
              <Avatar
                size={36}
                style={{ background: token.colorPrimary }}
                icon={<UserOutlined />}
              />
              <div style={{ overflow: "hidden" }}>
                <Text
                  style={{ color: "#fff", display: "block", fontSize: 13 }}
                  ellipsis
                >
                  {user?.full_name || user?.username}
                </Text>
                <Text
                  style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}
                >
                  {user?.role === "ADMIN" ? "Quản trị viên" : user?.role === "LANDLORD" ? "Chủ trọ" : "Người thuê"}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Collapse Toggle */}
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 8,
                transition: "background 0.2s",
              }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 18, color: "#6b7280" }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 18, color: "#6b7280" }} />
              )}
            </div>

            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: pageTitle },
              ]}
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Right Side Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Notifications */}
            <Badge count={3} size="small" style={{ boxShadow: "none" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <BellOutlined style={{ fontSize: 18, color: "#6b7280" }} />
              </div>
            </Badge>

            {/* User Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: "#f9fafb",
                  transition: "background 0.2s",
                }}
              >
                <Avatar
                  size={32}
                  style={{ background: token.colorPrimary }}
                  icon={<UserOutlined />}
                />
                <div style={{ lineHeight: 1.3 }}>
                  <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
                    {user?.full_name || user?.username}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                    {user?.role === "ADMIN" ? "Admin" : user?.role === "LANDLORD" ? "Chủ trọ" : "Người thuê"}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#f5f7fa",
            borderRadius: 16,
            minHeight: "calc(100vh - 64px - 70px)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: "center",
            background: "#fff",
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hệ thống Quản lý Phòng Trọ v1.0.0 | Phát triển với
            <span style={{ color: "#ef4444" }}> ❤ </span>
            bởi Team
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
