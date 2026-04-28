import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";
import viVN from "antd/locale/vi_VN";
import { theme } from "@/shared/theme";
import { MainLayout } from "./presentation/components/Layout/MainLayout";
import { LoginPage, RegisterPage } from "./presentation/pages/Auth";
import { DashboardPage } from "./presentation/pages/Dashboard";
import { RoomListPage, RoomFormPage } from "./presentation/pages/Rooms";
import { TenantListPage, TenantFormPage } from "./presentation/pages/Tenants";
import { ContractListPage, ContractFormPage } from "./presentation/pages/Contracts";
import { BillListPage, BillFormPage } from "./presentation/pages/Bills";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
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
          </BrowserRouter>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;