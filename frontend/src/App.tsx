import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";
import viVN from "antd/locale/vi_VN";
import { Suspense, lazy } from "react";
import { Spin } from "antd";
import { theme } from "@/shared/theme";
import { MainLayout } from "./presentation/components/Layout/MainLayout";

const LoginPage = lazy(() =>
  import("./presentation/pages/Auth/LoginPage").then((m) => ({
    default: m.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("./presentation/pages/Auth/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  }))
);
const DashboardPage = lazy(() =>
  import("./presentation/pages/Dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
const RoomListPage = lazy(() =>
  import("./presentation/pages/Rooms/RoomListPage").then((m) => ({
    default: m.RoomListPage,
  }))
);
const RoomFormPage = lazy(() =>
  import("./presentation/pages/Rooms/RoomFormPage").then((m) => ({
    default: m.RoomFormPage,
  }))
);
const TenantListPage = lazy(() =>
  import("./presentation/pages/Tenants/TenantListPage").then((m) => ({
    default: m.TenantListPage,
  }))
);
const TenantFormPage = lazy(() =>
  import("./presentation/pages/Tenants/TenantFormPage").then((m) => ({
    default: m.TenantFormPage,
  }))
);
const ContractListPage = lazy(() =>
  import("./presentation/pages/Contracts/ContractListPage").then((m) => ({
    default: m.ContractListPage,
  }))
);
const ContractFormPage = lazy(() =>
  import("./presentation/pages/Contracts/ContractFormPage").then((m) => ({
    default: m.ContractFormPage,
  }))
);
const BillListPage = lazy(() =>
  import("./presentation/pages/Bills/BillListPage").then((m) => ({
    default: m.BillListPage,
  }))
);
const BillFormPage = lazy(() =>
  import("./presentation/pages/Bills/BillFormPage").then((m) => ({
    default: m.BillFormPage,
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Spin size="large" />
    </div>
  );
}

function App() {
  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="rooms" element={<RoomListPage />} />
                  <Route path="rooms/new" element={<RoomFormPage />} />
                  <Route path="rooms/:id/edit" element={<RoomFormPage />} />
                  <Route path="tenants" element={<TenantListPage />} />
                  <Route path="tenants/new" element={<TenantFormPage />} />
                  <Route path="tenants/:id/edit" element={<TenantFormPage />} />
                  <Route path="contracts" element={<ContractListPage />} />
                  <Route path="contracts/new" element={<ContractFormPage />} />
                  <Route path="contracts/:id/edit" element={<ContractFormPage />} />
                  <Route path="bills" element={<BillListPage />} />
                  <Route path="bills/new" element={<BillFormPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
