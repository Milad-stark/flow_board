# راهنمای راه‌اندازی FlowBoard

## مرحله ۱: باز کردن Terminal

در پوشه اصلی پروژه (`D:\projects\flow_board\Desktop\new`) یک Terminal باز کنید.

## مرحله ۲: اجرای Docker Compose

دستور زیر را اجرا کنید:

```bash
docker compose up --build -d
```

این دستور:
- دیتابیس PostgreSQL را راه‌اندازی می‌کند
- بک‌اند Spring Boot را build و اجرا می‌کند
- فرانت‌اند React را build و اجرا می‌کند

**صبر کنید ۲-۳ دقیقه** تا همه سرویس‌ها کاملاً بالا بیایند.

## مرحله ۳: بررسی وضعیت سرویس‌ها

برای دیدن وضعیت سرویس‌ها:

```bash
docker compose ps
```

باید سه سرویس با وضعیت "Up" ببینید:
- ✅ flowboard-postgres
- ✅ flowboard-backend
- ✅ flowboard-frontend

## مرحله ۴: باز کردن سایت

مرورگر را باز کنید و به آدرس زیر بروید:

```
http://localhost
```

یا

```
http://localhost:80
```

## مرحله ۵: ورود به سیستم

از حساب کاربری پیش‌فرض استفاده کنید:

- **ایمیل**: `admin@flowboard.com`
- **رمز عبور**: `admin123`

## اگر مشکلی پیش آمد

### بررسی لاگ‌ها

```bash
# لاگ بک‌اند
docker compose logs backend

# لاگ دیتابیس
docker compose logs postgres

# لاگ فرانت‌اند
docker compose logs frontend
```

### راه‌اندازی مجدد

```bash
# توقف سرویس‌ها
docker compose down

# راه‌اندازی مجدد
docker compose up -d
```

### پاک کردن و شروع از اول

```bash
# توقف و حذف همه چیز
docker compose down -v

# راه‌اندازی مجدد
docker compose up --build -d
```

## توقف سرویس‌ها

وقتی کارتان تمام شد:

```bash
docker compose down
```

---

**نکته مهم**: بعد از اجرای `docker compose up --build -d`، ۲-۳ دقیقه صبر کنید تا همه سرویس‌ها کاملاً آماده شوند.

