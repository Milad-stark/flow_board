# FlowBoard - Full Stack Task Management System

یک سیستم مدیریت وظایف کامل با Docker، Spring Boot، React و PostgreSQL

## ساختار پروژه

```
project-root/
├── frontend/          # React + Vite Frontend
├── backend/           # Spring Boot Backend
├── database/          # PostgreSQL initialization scripts
└── docker-compose.yml # Docker Compose configuration
```

## ویژگی‌ها

- ✅ چندزبانه (فارسی/انگلیسی) با پشتیبانی کامل RTL
- ✅ احراز هویت JWT با نقش‌های ADMIN و USER
- ✅ مدیریت پروژه‌ها و وظایف
- ✅ Chatbot با ذخیره تاریخچه
- ✅ Docker-based deployment
- ✅ PostgreSQL با UUID primary keys

## پیش‌نیازها

- Docker و Docker Compose
- Git

## راه‌اندازی

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd flowboard
```

### 2. تنظیم متغیرهای محیطی (اختیاری)

ایجاد فایل `.env` در ریشه پروژه:

```env
JWT_SECRET=your-very-strong-secret-key-minimum-256-bits
CHATBOT_API_URL=https://your-chatbot-api.com/chat
CHATBOT_API_KEY=your-chatbot-api-key
```

### 3. اجرای پروژه

```bash
docker-compose up --build
```

این دستور:
- دیتابیس PostgreSQL را راه‌اندازی می‌کند
- بک‌اند Spring Boot را build و اجرا می‌کند
- فرانت‌اند React را build و با nginx اجرا می‌کند

### 4. دسترسی به برنامه

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080/api
- **PostgreSQL**: localhost:5432

## حساب کاربری پیش‌فرض

- **Email**: admin@flowboard.com
- **Password**: admin123

## API Endpoints

### احراز هویت

- `POST /api/auth/register` - ثبت‌نام
- `POST /api/auth/login` - ورود
- `GET /api/auth/me` - اطلاعات کاربر فعلی
- `PUT /api/auth/me` - بروزرسانی پروفایل

### پروژه‌ها

- `GET /api/projects` - لیست پروژه‌ها
- `POST /api/projects` - ایجاد پروژه
- `GET /api/projects/{id}` - دریافت پروژه
- `PUT /api/projects/{id}` - بروزرسانی پروژه
- `DELETE /api/projects/{id}` - حذف پروژه

### وظایف

- `GET /api/tasks` - لیست وظایف
- `GET /api/tasks/filter` - فیلتر وظایف
- `POST /api/tasks` - ایجاد وظیفه
- `PUT /api/tasks/{id}` - بروزرسانی وظیفه
- `DELETE /api/tasks/{id}` - حذف وظیفه

### Chatbot

- `POST /api/chatbot/message` - ارسال پیام
- `GET /api/chatbot/history/{userId}` - تاریخچه پیام‌ها

## ساختار Backend

```
backend/
├── src/main/java/com/flowboard/
│   ├── controller/    # REST Controllers
│   ├── service/        # Business Logic
│   ├── repository/     # Data Access Layer
│   ├── model/          # Entity Models
│   ├── dto/            # Data Transfer Objects
│   ├── config/         # Configuration
│   └── security/       # Security Configuration
└── src/main/resources/
    └── application.properties
```

## ساختار Frontend

```
frontend/
├── src/
│   ├── api/            # API Service Layer
│   ├── components/     # React Components
│   ├── pages/          # Page Components
│   ├── locales/        # Translation Files (fa.json, en.json)
│   └── utils/          # Utility Functions
└── Dockerfile
```

## توسعه

### اجرای Frontend به صورت Development

```bash
cd frontend
npm install
npm run dev
```

### اجرای Backend به صورت Development

```bash
cd backend
mvn spring-boot:run
```

## توقف سرویس‌ها

```bash
docker-compose down
```

برای حذف داده‌های دیتابیس:

```bash
docker-compose down -v
```

## لاگ‌ها

مشاهده لاگ‌های تمام سرویس‌ها:

```bash
docker-compose logs -f
```

مشاهده لاگ یک سرویس خاص:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## مشکلات رایج

### خطای اتصال به دیتابیس

اطمینان حاصل کنید که سرویس PostgreSQL در حال اجرا است:

```bash
docker-compose ps
```

### خطای Build

پاک کردن cache و rebuild:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## مجوز

این پروژه تحت مجوز MIT است.
