# Room Rental Management System - CLAUDE.md

## 1) Tổng quan dự án
- **Tên:** Website Quản Lý Cho Thuê Phòng Trọ
- **Backend:** Django 5 + Django REST Framework + PostgreSQL
- **Frontend:** React 18 + TypeScript + Ant Design + Vite
- **Vai trò:** ADMIN, LANDLORD, TENANT

## 2) Cấu trúc thư mục
```
backend/                  # Django project
├── config/              # Settings, urls, wsgi
├── apps/
│   ├── users/          # Auth, User management
│   ├── rooms/          # Room CRUD
│   ├── tenants/        # Tenant CRUD
│   ├── contracts/      # Contract CRUD
│   └── bills/          # Bill, Payment CRUD
├── manage.py
└── requirements.txt

frontend/                 # React project
├── src/
│   ├── presentation/   # Pages, components
│   ├── application/    # Hooks, contexts
│   ├── domain/         # Types, interfaces
│   ├── infrastructure/ # API clients, services
│   └── shared/         # Utils, constants
└── package.json
```

## 3) Lệnh chạy development
```bash
# Backend
cd backend
source venv/Scripts/activate    # Windows Git Bash
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

## 4) Quy trình Code → Test → Fix (BẮT BUỘC)

### 4.1 Trước khi code
1. Pull main mới nhất: `git pull origin main`
2. Tạo branch từ main: `git checkout -b feature/<module>-<desc>`

### 4.2 Khi code xong 1 function/feature
1. **Chạy Django check:** `python manage.py check`
2. **Chạy migrations:** `python manage.py makemigrations && python manage.py migrate`
3. **Chạy server:** `python manage.py runserver`
4. **Test API bằng Playwright MCP:**
   - Mở `http://localhost:8000/api/docs/` (Swagger UI)
   - Test từng endpoint qua browser bằng Playwright
   - Verify response data đúng schema
5. **Test FE bằng Playwright MCP:**
   - Mở `http://localhost:5173`
   - Navigate đến page tương ứng
   - Thao tác UI (click, fill form, submit)
   - Verify dữ liệu hiển thị đúng

### 4.3 Khi test phát hiện bug
1. Ghi nhận bug cụ thể: endpoint nào, data gì, kết quả thực tế vs mong đợi
2. Fix bug
3. Chạy lại test từ đầu (không chỉ test phần fix)
4. Chỉ commit khi test pass hoàn toàn

### 4.4 Playwright MCP Test Checklist
Với mỗi API endpoint:
- [ ] GET list: trả về 200, có pagination
- [ ] GET detail: trả về 200 với đúng data
- [ ] POST create: trả về 201, data lưu đúng DB
- [ ] PUT/PATCH update: trả về 200, data update đúng
- [ ] DELETE: trả về 204, data bị xóa/mark inactive
- [ ] Auth: endpoint có guard đúng role
- [ ] Validation: input sai trả về 400 với error message rõ ràng

Với mỗi trang UI:
- [ ] Page load không crash
- [ ] Data hiển thị đúng từ API
- [ ] Form submit hoạt động
- [ ] Error state hiển thị đúng
- [ ] Loading state hiển thị đúng

## 5) Git flow
- `main`: production-ready
- `feature/<module>-<desc>`: từ main
- `fix/<module>-<desc>`: từ main
- Commit: dùng Conventional Commits (`feat:`, `fix:`, `chore:`)
- **KHÔNG đẩy document (docx, spec md) lên git**

## 6) Django coding rules
- Mỗi app có: models.py, serializers.py, views.py, urls.py, admin.py
- Serializer tách biệt: ListSerializer, CreateSerializer, UpdateSerializer
- ViewSet dùng DRF generics
- RBAC: kiểm tra `request.user.role` trong view
- Validation ở serializer level
- Không dùng `any` trong Python type hints

## 7) React coding rules
- TypeScript strict bắt buộc
- Component đặt trong `src/presentation/`
- API calls qua `src/infrastructure/` (axios instance)
- State management dùng Zustand
- Form dùng React Hook Form + Zod
- UI components dùng Ant Design

## 8) Testing
- Backend: pytest + pytest-django
- Frontend: vitest + testing-library
- E2E: **Playwright MCP** (BẮT BUỘC dùng cho mọi luồng chính)
- Mỗi PR phải có bằng chứng test pass
