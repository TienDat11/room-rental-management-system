import { Row, Col, Card, Statistic, Typography, Progress, Space, Tag } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { useRooms } from "@/application/hooks/useRooms";
import { useTenants } from "@/application/hooks/useTenants";
import { useContracts } from "@/application/hooks/useContracts";
import { useBills } from "@/application/hooks/useBills";
import type { Room } from "@/domain/models/Room";
import type { Contract } from "@/domain/models/Contract";
import type { Bill } from "@/domain/models/Bill";

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  suffix?: string;
}

function StatCard({ title, value, icon, color, bgColor, suffix }: StatCardProps) {
  return (
    <Card
      style={{
        borderRadius: 16,
        border: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            suffix={suffix}
            valueStyle={{ fontSize: 32, fontWeight: 700, color: color }}
          />
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { data: roomsData } = useRooms();
  const { data: tenantsData } = useTenants();
  const { data: contractsData } = useContracts();
  const { data: billsData } = useBills();

  const rooms = roomsData?.results || [];
  const totalRooms = roomsData?.count || 0;
  const availableRooms = rooms.filter((r: Room) => r.status === "AVAILABLE").length;
  const occupiedRooms = rooms.filter((r: Room) => r.status === "OCCUPIED").length;
  const maintenanceRooms = rooms.filter((r: Room) => r.status === "MAINTENANCE").length;

  const totalTenants = tenantsData?.count || 0;
  const activeContracts = contractsData?.results?.filter((c: Contract) => c.status === "ACTIVE").length || 0;
  const pendingBills = billsData?.results?.filter((b: Bill) => b.status === "PENDING").length || 0;
  const overdueBills = billsData?.results?.filter((b: Bill) => b.status === "OVERDUE").length || 0;

  // Calculate occupancy rate
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <div style={{ padding: "0 4px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          Dashboard
        </Title>
        <Text type="secondary">Tổng quan hệ thống quản lý phòng trọ</Text>
      </div>

      {/* Stats Grid */}
      <Row gutter={[20, 20]}>
        {/* Total Rooms */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng số phòng"
            value={totalRooms}
            icon={<HomeOutlined style={{ fontSize: 24, color: "#1677ff" }} />}
            color="#1677ff"
            bgColor="#e6f4ff"
            suffix="phòng"
          />
        </Col>

        {/* Available Rooms */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Phòng còn trống"
            value={availableRooms}
            icon={<CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />}
            color="#52c41a"
            bgColor="#f6ffed"
            suffix="phòng"
          />
        </Col>

        {/* Occupied Rooms */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Phòng đã thuê"
            value={occupiedRooms}
            icon={<HomeOutlined style={{ fontSize: 24, color: "#fa8c16" }} />}
            color="#fa8c16"
            bgColor="#fff7e6"
            suffix="phòng"
          />
        </Col>

        {/* Total Tenants */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Người thuê"
            value={totalTenants}
            icon={<TeamOutlined style={{ fontSize: 24, color: "#722ed1" }} />}
            color="#722ed1"
            bgColor="#f9f0ff"
            suffix="người"
          />
        </Col>
      </Row>

      {/* Second Row - More Details */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        {/* Occupancy Rate Card */}
        <Col xs={24} lg={12}>
          <Card
            style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            styles={{ body: { padding: 24 } }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>Tỷ lệ lấp đầy phòng</Text>
                <Title level={2} style={{ margin: "8px 0 0" }}>
                  {occupancyRate}%
                </Title>
              </div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RiseOutlined style={{ fontSize: 24, color: "#fff" }} />
              </div>
            </div>
            <Progress
              percent={occupancyRate}
              strokeColor={{ "0%": "#1677ff", "100%": "#52c41a" }}
              trailColor="#f0f0f0"
              strokeWidth={12}
              style={{ borderRadius: 8 }}
            />
            <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
              <div>
                <Tag color="success" style={{ borderRadius: 6 }}>Đã thuê: {occupiedRooms}</Tag>
              </div>
              <div>
                <Tag color="processing" style={{ borderRadius: 6 }}>Còn trống: {availableRooms}</Tag>
              </div>
              {maintenanceRooms > 0 && (
                <div>
                  <Tag color="warning" style={{ borderRadius: 6 }}>Bảo trì: {maintenanceRooms}</Tag>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Active Contracts & Bills */}
        <Col xs={24} lg={12}>
          <Card
            style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            styles={{ body: { padding: 24 } }}
          >
            <Title level={5} style={{ marginBottom: 20 }}>Hợp đồng & Hóa đơn</Title>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div
                  style={{
                    padding: 16,
                    background: "#e6fffb",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "#13c2c2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: 20, color: "#fff" }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>Hợp đồng hiệu lực</Text>
                    <Text strong style={{ fontSize: 20 }}>{activeContracts}</Text>
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div
                  style={{
                    padding: 16,
                    background: "#fff7e6",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "#fa8c16",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ClockCircleOutlined style={{ fontSize: 20, color: "#fff" }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>Hóa đơn chờ thanh toán</Text>
                    <Text strong style={{ fontSize: 20 }}>{pendingBills}</Text>
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div
                  style={{
                    padding: 16,
                    background: "#fff1f0",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <WarningOutlined style={{ fontSize: 20, color: "#fff" }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>Hóa đơn quá hạn</Text>
                    <Text strong style={{ fontSize: 20, color: "#ff4d4f" }}>{overdueBills}</Text>
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div
                  style={{
                    padding: 16,
                    background: "#f6ffed",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "#52c41a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DollarOutlined style={{ fontSize: 20, color: "#fff" }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>Hóa đơn đã thanh toán</Text>
                    <Text strong style={{ fontSize: 20, color: "#52c41a" }}>
                      {billsData?.results?.filter((b: Bill) => b.status === "PAID").length || 0}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Summary */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24}>
          <Card
            style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            styles={{ body: { padding: "16px 24px" } }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <Space size={24} wrap>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#52c41a",
                    }}
                  />
                  <Text type="secondary">Còn trống: <Text strong>{availableRooms}</Text></Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#fa8c16",
                    }}
                  />
                  <Text type="secondary">Đã thuê: <Text strong>{occupiedRooms}</Text></Text>
                </div>
                {maintenanceRooms > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ff7875",
                      }}
                    />
                    <Text type="secondary">Bảo trì: <Text strong>{maintenanceRooms}</Text></Text>
                  </div>
                )}
              </Space>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}