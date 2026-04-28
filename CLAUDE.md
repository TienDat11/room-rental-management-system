# Room Rental Management System - CLAUDE.md

> **QUAN TRỌNG**: Đọc file này TRƯỚC khi bắt đầu bất kỳ task nào.
> Đây là hướng dẫn CHẶT CHẼ cho AI models implement code. Làm ĐÚNG yêu cầu, KHÔNG thêm thừa.

---

## 1) Tổng quan dự án

- **Tên:** Website Quản Lý Cho Thuê Phòng Trọ
- **Backend:** Django 5 + Django REST Framework + PostgreSQL (Neon)
- **Frontend:** React 18 + TypeScript + Ant Design + Vite
- **Deploy:** Render (backend) + Vercel (frontend) + Neon (Postgres)
- **Vai trò:** ADMIN, LANDLORD, TENANT

## 2) Cấu trúc thư mục (CHÍNH XÁC)

```
D:\du_an_chi_linh\
├── backend/                    # Django project
│   ├── config/                 # Settings, urls, wsgi
│   │   ├── settings.py         # Main settings (đọc env vars)
│   │   ├── urls.py             # Root URL config
│   │   └── wsgi.py             # WSGI entry point
│   ├── apps/
│   │   ├── users/             # Auth, User management (AbstractUser)
│   │   │   ├── models.py      # User model với Role (ADMIN/LANDLORD/TENANT)
│   │   │   ├── serializers.py # AuthSerializer, UserSerializer
│   │   │   ├── views.py       # RegisterView, LoginView, MeView
│   │   │   └── urls.py        # /api/auth/*
│   │   ├── rooms/             # Room CRUD
│   │   │   ├── models.py      # Room model (roomNumber, floor, area, basePrice, status)
│   │   │   ├── serializers.py # ListSerializer, CreateSerializer, UpdateSerializer
│   │   │   ├── views.py       # RoomViewSet với RBAC
│   │   │   └── urls.py        # /api/rooms/*
│   │   ├── tenants/           # Tenant CRUD
│   │   ├── contracts/         # Contract CRUD
│   │   └── bills/             # Bill, Payment CRUD
│   ├── manage.py
│   ├── requirements.txt
│   └── venv/                  # Virtual environment (KHÔNG commit)
│
├── frontend/                   # React project
│   ├── src/
│   │   ├── App.tsx            # Root component với routes
│   │   ├── main.tsx           # Entry point
│   │   ├── presentation/      # Pages, components (Ant Design)
│   │   ├── application/       # Hooks, contexts, Zustand stores
│   │   ├── domain/            # Types, interfaces
│   │   ├── infrastructure/    # API clients (axios instance)
│   │   └── shared/            # Utils, constants
│   ├── package.json
│   ├── vite.config.ts         # Dev proxy /api → localhost:8000
│   └── tsconfig.json
│
├── .github/workflows/
│   └── deploy.yml             # CI/CD: test → deploy
├── render.yaml                # Backend deploy config
├── vercel.json                # Frontend deploy + API proxy
└── wiki/                      # Knowledge base files
```

## 3) Lệnh chạy (COPY CHÍNH XÁC)

```bash
# === BACKEND ===
cd backend
source venv/Scripts/activate    # Windows Git Bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver      # http://localhost:8000

# === FRONTEND ===
cd frontend
npm install
npm run dev                     # http://localhost:5173

# === TEST ===
cd backend && pytest --tb=short -q                    # Backend unit test
cd frontend && npm test -- --run                      # Frontend unit test

# === BUILD ===
cd backend && python manage.py collectstatic --noinput  # Static files
cd frontend && npm run build                            # Vite build → dist/
```

## 4) Django Coding Rules (TUÂN THỦ NGHIÊM NGẶT)

### 4.1 Model Pattern
```python
# Mỗi model phải có:
class Room(models.Model):
    # Fields với verbose_name
    room_number = models.CharField(_("room number"), max_length=20, unique=True)
    status = models.CharField(_("status"), max_length=15, choices=Status.choices, default=Status.AVAILABLE)

    class Meta:
        verbose_name = _("room")
        ordering = ["room_number"]

    def __str__(self):
        return self.room_number
```

### 4.2 Serializer Pattern (TÁCH BIỆT)
```python
# KHÔNG dùng 1 serializer cho tất cả. TÁCH RIÊNG:
class RoomListSerializer(serializers.ModelSerializer):
    """Chỉ dùng cho GET list - include related fields"""
    landlord_name = serializers.CharField(source="landlord.full_name", read_only=True)

    class Meta:
        model = Room
        fields = ["id", "room_number", "floor", "status", "landlord_name"]

class RoomCreateSerializer(serializers.ModelSerializer):
    """Chỉ dùng cho POST - validate đầy đủ"""
    class Meta:
        model = Room
        fields = ["room_number", "floor", "area", "base_price", "amenities"]

    def validate_room_number(self, value):
        if Room.objects.filter(room_number=value).exists():
            raise serializers.ValidationError("Số phòng đã tồn tại")
        return value

class RoomUpdateSerializer(serializers.ModelSerializer):
    """Chỉ dùng för PUT/PATCH - tất cả fields optional"""
    class Meta:
        model = Room
        fields = ["floor", "area", "base_price", "status", "amenities"]
        extra_kwargs = {f: {"required": False} for f in fields}
```

### 4.3 View Pattern (RBAC)
```python
class RoomViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list" or self.action == "retrieve":
            return RoomListSerializer
        elif self.action == "create":
            return RoomCreateSerializer
        return RoomUpdateSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Room.objects.all()
        elif user.is_landlord:
            return Room.objects.filter(landlord=user)
        return Room.objects.filter(status=Room.Status.AVAILABLE)

    def perform_create(self, serializer):
        # Tự động gán landlord = user hiện tại
        serializer.save(landlord=self.request.user)
```

### 4.4 URL Pattern
```python
# apps/rooms/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.RoomViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
```

## 5) React Coding Rules (TUÂN THỦ NGHIÊM NGẶT)

### 5.1 API Client (infrastructure/)
```typescript
// src/infrastructure/api/client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        const { data } = await axios.post("/api/auth/refresh/", { refresh: refreshToken });
        localStorage.setItem("access_token", data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 5.2 Zustand Store Pattern
```typescript
// src/application/stores/authStore.ts
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  login: async (username, password) => {
    const { data } = await apiClient.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    set({ user: data.user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
  },
}));
```

### 5.3 Component Pattern
```typescript
// src/presentation/pages/RoomListPage.tsx
import { useEffect } from "react";
import { Table, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../infrastructure/api/client";

export const RoomListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => apiClient.get("/rooms/").then((res) => res.data),
  });

  const columns = [
    { title: "Số phòng", dataIndex: "room_number", key: "room_number" },
    { title: "Tầng", dataIndex: "floor", key: "floor" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: Room) => (
        <Button type="link" onClick={() => navigate(`/rooms/${record.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return <Table dataSource={rooms?.results} columns={columns} loading={isLoading} rowKey="id" />;
};
```

## 6) Deployment Checklist

### 6.1 Pre-deploy
- [ ] `python manage.py check` → 0 issues
- [ ] `python manage.py migrate` → OK
- [ ] `cd frontend && npm run build` → exit 0
- [ ] Không có `print()` hay `console.log()` trong code
- [ ] Không có hardcoded URLs (dùng env vars)
- [ ] Migrations đã commit

### 6.2 Deploy Backend (Render)
1. Push lên main → GitHub Actions auto-trigger
2. Render nhận deploy hook → build + migrate + start
3. Verify: `curl https://room-rental-management-system.onrender.com/api/docs/` → 200

### 6.3 Deploy Frontend (Vercel)
1. Push lên main → Vercel auto-deploy
2. Build: `npm run build` → Vercel serve từ `dist/`
3. API proxy: `/api/*` → Render backend (xem vercel.json)

### 6.4 Post-deploy Verification
- [ ] Frontend load được: https://room-rental-management-system.vercel.app
- [ ] API docs load được: https://room-rental-management-system.onrender.com/api/docs/
- [ ] Đăng nhập được với account test
- [ ] CORS không bị block (check browser console)
- [ ] Static files load được (CSS, JS)

## 7) Troubleshooting Guide

### 7.1 CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Fix:** Kiểm tra `CORS_ALLOWED_ORIGINS` trong settings.py và Render env vars
phải chứa đúng URL frontend Vercel.

### 7.2 Database Connection Error
```
connection to server failed, SSL required
```
**Fix:** Neon PostgreSQL yêu cầu SSL. settings.py đã auto-append `sslmode=require`.
Kiểm tra DATABASE_URL env var format: `postgresql://user:pass@host/db?sslmode=require`

### 7.3 Migration Error
```
django.db.migrations.exceptions.InconsistentMigrationHistory
```
**Fix:**
1. Local: `python manage.py migrate --fake <app> <migration>`
2. Production: Kiểm tra Neon database, chạy `python manage.py showmigrations` để xem trạng thái

### 7.4 Frontend Build Fail
```
Type error: ...
```
**Fix:** Chạy `cd frontend && npx tsc --noEmit` để xem TypeScript errors cụ thể.
Sửa từng lỗi. KHÔNG dùng `@ts-ignore` hay `any`.

### 7.5 500 Internal Server Error trên Render
**Fix:** Xem logs trong Render Dashboard → Logs. Thường do:
- Thiếu env var (DATABASE_URL, SECRET_KEY)
- Migration chưa chạy (chạy manual trong Render Shell)
- Import error (check requirements.txt)

## 8) NEPs (KHÔNG ĐƯỢC LÀM)

### 8.1 KHÔNG
- ❌ Dùng `any` trong TypeScript
- ❌ Dùng 1 serializer cho cả list/create/update
- ❌ Hardcode URL hay secret trong code
- ❌ Commit `venv/`, `node_modules/`, `db.sqlite3`, `.env`
- ❌ Push document files (.docx, .md spec) lên git
- ❌ Dùng `@ts-ignore` hay `// eslint-disable`
- ❌ Bỏ qua RBAC check trong views
- ❌ Dùng `ModelSerializer` không tách biệt cho create/update
- ❌ Gọi API trực tiếp trong component (dùng React Query)
- ❌ Dùng Redux (project dùng Zustand)

### 8.2 PHẢI
- ✅ Tách serializer: List, Create, Update riêng
- ✅ RBAC trong mọi view (check `request.user.role`)
- ✅ Validation ở serializer level, KHÔNG ở view
- ✅ Dùng React Query cho API calls
- ✅ Dùng Zustand cho global state
- ✅ Dùng Ant Design components
- ✅ Dùng React Hook Form + Zod cho forms
- ✅ Viết test cho mọi API endpoint
- ✅ Follow conventional commits: `feat:`, `fix:`, `chore:`

## 9) API Endpoints (MVP)

### Auth
```
POST /api/auth/login/          # JWT login → {access, refresh}
POST /api/auth/register/       # Admin tạo user mới
POST /api/auth/refresh/        # Refresh JWT token
GET  /api/auth/me/             # Current user info
```

### Rooms
```
GET    /api/rooms/             # List (LANDLORD: của mình, ADMIN: tất cả)
POST   /api/rooms/             # Create (LANDLORD)
GET    /api/rooms/{id}/        # Detail
PUT    /api/rooms/{id}/        # Update (LANDLORD sở hữu)
DELETE /api/rooms/{id}/        # Soft delete (LANDLORD sở hữu)
```

### Tenants, Contracts, Bills: tương tự pattern trên

### Reports
```
GET /api/reports/revenue/      # Doanh thu (LANDLORD/ADMIN)
GET /api/reports/occupancy/    # Tỷ lệ lấp đầy
```

## 10) Testing Rules

### Backend (pytest)
```python
# tests/test_rooms.py
import pytest
from rest_framework.test import APIClient
from apps.users.models import User

@pytest.fixture
def landlord():
    return User.objects.create_user(username="landlord1", password="pass123", role="LANDLORD")

@pytest.fixture
def api_client(landlord):
    client = APIClient()
    client.force_authenticate(user=landlord)
    return client

def test_create_room(api_client):
    resp = api_client.post("/api/rooms/", {"room_number": "101", "floor": 1, "base_price": 3000000})
    assert resp.status_code == 201
    assert resp.data["room_number"] == "101"
```

### Frontend (vitest)
```typescript
// src/test/RoomList.test.tsx
import { render, screen } from "@testing-library/react";
import { RoomListPage } from "../presentation/pages/RoomListPage";

test("renders room list page", () => {
  render(<RoomListPage />);
  expect(screen.getByText(/phòng/i)).toBeInTheDocument();
});
```

### E2E (Playwright)
```typescript
// e2e/login.spec.ts
test("login flow", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
});
```
