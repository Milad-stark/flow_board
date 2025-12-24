# ✅ چک‌لیست قبل از Push

## بررسی‌های انجام شده:

### ✅ امنیت
- [x] فایل‌های `.env` در `.gitignore` هستند
- [x] رمزهای عبور و کلیدهای API در کد hardcode نشده‌اند
- [x] JWT_SECRET در docker-compose.yml با متغیر محیطی قابل تنظیم است

### ✅ فایل‌های غیرضروری
- [x] `node_modules` در `.gitignore` است
- [x] فایل‌های `dist` و `build` در `.gitignore` هستند
- [x] فایل‌های `target` (Maven build) در `.gitignore` هستند
- [x] فایل‌های log در `.gitignore` هستند

### ✅ ساختار پروژه
- [x] ساختار Docker کامل است
- [x] فایل‌های Dockerfile موجود هستند
- [x] docker-compose.yml موجود است
- [x] فایل‌های README موجود هستند

### ✅ کد
- [x] کدهای mock و واقعی هر دو موجود هستند (fallback)
- [x] API Service layer آماده است
- [x] چندزبانه‌سازی (FA/EN) پیاده‌سازی شده
- [x] RTL support اضافه شده

## فایل‌های مهم که Push می‌شوند:

✅ **Backend:**
- تمام فایل‌های Java
- pom.xml
- application.properties
- Dockerfile

✅ **Frontend:**
- تمام فایل‌های React
- package.json
- Dockerfile
- nginx.conf
- فایل‌های locale (fa.json, en.json)

✅ **Database:**
- init.sql

✅ **Docker:**
- docker-compose.yml
- تمام Dockerfileها

✅ **مستندات:**
- README.md
- SETUP_GUIDE.md
- QUICK_START.md
- DOCKER_SETUP.md

## فایل‌هایی که Push نمی‌شوند (در .gitignore):

❌ node_modules
❌ dist / build / target
❌ .env files
❌ log files
❌ IDE files (.vscode, .idea)
❌ OS files (.DS_Store, Thumbs.db)

## آماده برای Push! ✅

پروژه شما آماده است و می‌توانید با خیال راحت push کنید.

