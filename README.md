# 🛒 Grocery Store - Hệ Thống Cửa Hàng Tạp Hóa Trực Tuyến

![Banner](./Thumnails.png)

## Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Testing](#testing)
- [CI/CD](#cicd)
- [API Endpoints](#api-endpoints)
- [Tài Khoản Mặc Định](#tài-khoản-mặc-định)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Giới Thiệu

Grocery Store là một hệ thống quản lý cửa hàng tạp hóa trực tuyến full-stack, được xây dựng với kiến trúc MERN Stack (MongoDB, Express.js, React, Node.js). Dự án cung cấp giải pháp toàn diện cho việc mua bán hàng hóa trực tuyến với giao diện người dùng thân thiện, hệ thống quản trị mạnh mẽ, và tính năng real-time với Socket.io và Redis.

### 🎯 Điểm Nổi Bật

- ✅ Kiến trúc microservices với 4 services độc lập (Client, Server, Admin, Admin Server)
- ✅ Giao diện hiện đại, responsive với Tailwind CSS
- ✅ Real-time notifications với Socket.io và Redis adapter
- ✅ Xác thực và phân quyền người dùng với JWT
- ✅ Quản lý giỏ hàng và đơn hàng thời gian thực
- ✅ Tích hợp thanh toán đa nền tảng (Stripe, VNPAY, COD)
- ✅ Hệ thống danh mục phân cấp (Category & SubCategory)
- ✅ Tìm kiếm sản phẩm với full-text search
- ✅ Upload và quản lý hình ảnh với Cloudinary
- ✅ Testing với Jest và Supertest (Unit & Integration tests)
- ✅ CI/CD automation với GitHub Actions
- ✅ Containerization với Docker và Docker Compose
- ✅ Email service với Resend

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        Users / Admins                        │
└────────────────────┬──────────────────┬─────────────────────┘
                     │                  │
            ┌────────▼────────┐  ┌─────▼──────────┐
            │  Client (5173)  │  │  Admin (5174)  │
            │   React + Vite  │  │  React + Vite  │
            └────────┬────────┘  └─────┬──────────┘
                     │                  │
            ┌────────▼────────┐  ┌─────▼──────────────┐
            │ Server (8080)   │  │ Admin Server (8081)│
            │ Express + Node  │  │  Express + Node    │
            └────────┬────────┘  └─────┬──────────────┘
                     │                  │
                     └────────┬─────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
          ┌──────▼─────┐ ┌───▼────┐ ┌────▼─────────┐
          │  MongoDB   │ │ Redis  │ │  Cloudinary  │
          │  Database  │ │ Cache  │ │   Storage    │
          └────────────┘ └────────┘ └──────────────┘
```

## Tính Năng

### 🛍️ Người Dùng (Customer)
- ✅ Đăng ký và đăng nhập tài khoản
- ✅ Quên mật khẩu và khôi phục qua email
- ✅ Xem và tìm kiếm sản phẩm với full-text search
- ✅ Lọc sản phẩm theo danh mục và danh mục con
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Quản lý giỏ hàng (thêm, xóa, cập nhật số lượng)
- ✅ Quản lý địa chỉ giao hàng (CRUD)
- ✅ Đặt hàng và thanh toán đa phương thức (COD/Stripe/VNPAY)
- ✅ Xem lịch sử đơn hàng và trạng thái đơn hàng real-time
- ✅ Cập nhật thông tin cá nhân và avatar
- ✅ Nhận thông báo real-time khi đơn hàng thay đổi trạng thái

### 👨‍💼 Quản Trị Viên (Admin)
- ✅ Dashboard quản lý tổng quan
- ✅ Quản lý danh mục và danh mục con (CRUD)
- ✅ Quản lý sản phẩm (CRUD) với upload multiple images
- ✅ Quản lý trạng thái và tồn kho sản phẩm
- ✅ Quản lý đơn hàng và cập nhật trạng thái
- ✅ Quản lý người dùng (view, update, block/unblock)
- ✅ Upload và quản lý hình ảnh với Cloudinary
- ✅ Xem thống kê doanh thu và báo cáo
- ✅ Gửi notification real-time đến khách hàng

## Công Nghệ Sử Dụng

### 🎨 Frontend
- **React 18.3.1** - Thư viện UI
- **Vite** - Build tool và dev server siêu nhanh
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form validation và handling
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **SweetAlert2** - Beautiful alerts và dialogs
- **Stripe.js** - Stripe payment integration
- **TanStack Table** - Powerful data tables
- **Socket.io Client** - Real-time communication
- **Vitest** - Fast unit testing framework

### ⚙️ Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - NoSQL database
- **JWT (jsonwebtoken)** - Authentication & authorization
- **Bcrypt.js** - Password hashing
- **Cloudinary** - Cloud image storage
- **Multer** - File upload middleware
- **Stripe** - Payment processing
- **Resend** - Transactional email service
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Cookie Parser** - Cookie parsing
- **CORS** - Cross-origin resource sharing
- **Socket.io** - Real-time bidirectional communication
- **Redis & @socket.io/redis-adapter** - Distributed Socket.io với Redis
- **Crypto** - Cryptographic functionality

### 🧪 Testing & Quality Assurance
- **Jest** - JavaScript testing framework
- **Supertest** - HTTP integration testing
- **MongoDB Memory Server** - In-memory MongoDB for testing
- **Cross-env** - Cross-platform environment variables
- **Vitest** - Frontend testing (Client)
- **@testing-library/react** - React component testing
- **MSW (Mock Service Worker)** - API mocking

### 🚀 DevOps & CI/CD
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD automation
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting
- **Railway / Vercel** - Cloud deployment platforms

## Cấu Trúc Dự Án

```
Grocery-Store/
├── 📱 client/                       # Frontend cho khách hàng (Port 5173)
│   ├── src/
│   │   ├── assets/                 # Hình ảnh, icons, fonts
│   │   ├── common/
│   │   │   └── SummaryApi.js      # API endpoints configuration
│   │   ├── components/             # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CardProduct.jsx
│   │   │   └── AddToCartButton.jsx
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── layouts/                # Layout components
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── Checkout.jsx
│   │   ├── provider/               # Context providers
│   │   ├── route/                  # Route configuration
│   │   ├── socket/                 # Socket.io client setup
│   │   ├── store/                  # Redux store & slices
│   │   └── utils/                  # Utility functions
│   ├── coverage/                   # Test coverage reports
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── 👨‍💼 admin/                        # Frontend cho admin (Port 5174)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Categories.jsx
│   │   ├── socket/                 # Socket.io admin client
│   │   └── store/
│   ├── Dockerfile
│   └── package.json
│
├── 🔧 server/                       # Backend API cho client (Port 8080)
│   ├── __tests__/                  # Tests
│   │   ├── unit/                   # Unit tests
│   │   └── integration/            # Integration tests
│   ├── config/
│   │   ├── connectDB.js           # MongoDB connection
│   │   ├── sendEmail.js           # Email configuration
│   │   └── stripe.js              # Stripe configuration
│   ├── controllers/                # Business logic
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.js                # JWT authentication
│   │   └── multer.js              # File upload
│   ├── models/                     # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   └── cartproduct.model.js
│   ├── route/                      # API routes
│   │   ├── user.route.js
│   │   ├── product.route.js
│   │   └── cart.route.js
│   ├── socket/                     # Socket.io server setup
│   │   └── index.js
│   ├── utils/                      # Utility functions
│   ├── coverage/                   # Test coverage reports
│   ├── Dockerfile
│   ├── index.js                    # Entry point
│   ├── package.json
│   └── jest.config.js
│
├── 👨‍💼 admin_server/                # Backend API cho admin (Port 8081)
│   ├── __test__/                   # Tests
│   │   ├── unit/                   # Unit tests
│   │   └── __mocks__/              # Mock data
│   ├── config/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── category.controller.js
│   │   └── subCategory.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── Admin.js
│   ├── models/
│   ├── route/
│   ├── socket/
│   ├── coverage/                   # Test coverage reports
│   ├── Dockerfile
│   ├── jest.config.js
│   └── package.json
│
├── 🐳 docker-compose.yml            # Docker orchestration
├── 📝 .env                          # Environment variables (root)
├── 🔄 .github/workflows/            # CI/CD pipelines
│   ├── server-ci.yml               # Server CI pipeline
│   ├── admin-server-ci.yml         # Admin server CI pipeline
│   └── client-ci.yml               # Client CI pipeline
└── 📖 README.md                     # Documentation
```

## Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Node.js** >= 16.x (khuyến nghị 18.x hoặc 20.x)
- **MongoDB** >= 5.x (hoặc MongoDB Atlas)
- **Redis** >= 6.x (cho real-time features)
- **npm** hoặc **yarn**
- **Docker & Docker Compose** (tùy chọn, khuyến nghị)
- **Git** (để clone repository)

### Tài Khoản Bên Thứ Ba
- **MongoDB Atlas** (nếu không dùng MongoDB local)
- **Cloudinary** (để lưu trữ hình ảnh)
- **Stripe** (để thanh toán)
- **Resend** (để gửi email)
- **VNPAY** (tùy chọn, cho thanh toán VNPAY)

## Cài Đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/Sog1n/Grocery-Store.git
cd Grocery-Store
```

### Bước 2: Cài Đặt Dependencies

#### Server (Backend cho Client)
```bash
cd server
npm install
cd ..
```

#### Admin Server (Backend cho Admin)
```bash
cd admin_server
npm install
cd ..
```

#### Client (Frontend cho Customer)
```bash
cd client
npm install
cd ..
```

#### Admin (Frontend cho Admin)
```bash
cd admin
npm install
cd ..
```

## Cấu Hình

### 1. Root .env File

Tạo file `.env` ở thư mục gốc (root) cho Docker Compose:

```env
# =================================
# 🐳 DOCKER COMPOSE ENVIRONMENT FILE
# =================================

# 📋 Database Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Grocery?retryWrites=true

# 🌐 Network Configuration  
FRONTEND_URL=http://localhost:5173
FRONTEND_ADMIN_URL=http://localhost:5174
BACKEND_URL=http://localhost:8080
BACKEND_ADMIN_URL=http://localhost:8081
FRONTEND_PORT=5173
FRONTEND_ADMIN_PORT=5174
BACKEND_PORT=8080
BACKEND_ADMIN_PORT=8081
MONGODB_PORT=27017

# 🔐 JWT Secrets - Client
SECRET_KEY_ACCESS_TOKEN=your_secret_access_token_here
SECRET_KEY_REFRESH_TOKEN=your_secret_refresh_token_here

# 🔐 JWT Secrets - Admin
SECRET_KEY_ACCESS_TOKEN_ADMIN=your_admin_access_token
SECRET_KEY_REFRESH_TOKEN_ADMIN=your_admin_refresh_token

# ☁️ Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# 📧 Email Service
RESEND_API=your_resend_api_key

# 💳 Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_your_webhook_secret

# 💰 VNPAY Configuration (Optional)
VNP_TMN_CODE=your_vnpay_code
VNP_HASH_SECRET=your_vnpay_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/vnpay-return

# 🔧 Redis Configuration
REDIS_URL=redis://localhost:6379

# 🎯 API URLs
VITE_API_URL=http://localhost:8080
VITE_API_URL_ADMIN=http://localhost:8081

# 🔑 JWT Secret for Socket.io
JWT_SECRET=your_jwt_secret_for_socket
```

### 2. Server .env File

Tạo file `server/.env`:

```env
BACKEND_PORT=8080
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string

# JWT
SECRET_KEY_ACCESS_TOKEN=your_access_token_secret
SECRET_KEY_REFRESH_TOKEN=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email
RESEND_API=your_resend_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_your_webhook_secret

# VNPAY
VNP_TMN_CODE=your_vnpay_code
VNP_HASH_SECRET=your_vnpay_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/vnpay-return

# Redis & Socket.io
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

### 3. Admin Server .env File

Tạo file `admin_server/.env`:

```env
BACKEND_PORT=8081
FRONTEND_URL=http://localhost:5174
MONGODB_URI=your_mongodb_connection_string

# JWT (Admin)
SECRET_KEY_ACCESS_TOKEN=your_admin_access_token
SECRET_KEY_REFRESH_TOKEN=your_admin_refresh_token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email
RESEND_API=your_resend_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_your_webhook_secret

# Redis & Socket.io
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

### 4. Client .env File

Tạo file `client/.env`:

```env
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 5. Admin .env File

Tạo file `admin/.env`:

```env
VITE_API_URL=http://localhost:8081
```

## Chạy Ứng Dụng

### 🐳 Chạy Với Docker Compose (Khuyến Nghị)

Docker Compose sẽ tự động khởi động tất cả services: MongoDB, Redis, Server, Admin Server, Client, và Admin.

```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend_client
docker-compose logs -f frontend_client

# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

**Services sẽ chạy tại:**
- 🌐 **Client Frontend:** http://localhost:5173
- 👨‍💼 **Admin Frontend:** http://localhost:5174
- 🔧 **Server API:** http://localhost:8080
- 👨‍💼 **Admin Server API:** http://localhost:8081
- 🗄️ **MongoDB:** localhost:27017
- 🔴 **Redis:** localhost:6379

### 💻 Chạy Thủ Công (Development)

#### 1. Khởi động MongoDB và Redis

```bash
# MongoDB (nếu cài local)
mongod

# Redis (nếu cài local)
redis-server
```

#### 2. Khởi động Backend Server (Terminal 1)

```bash
cd server
npm run dev
```

#### 3. Khởi động Admin Server (Terminal 2)

```bash
cd admin_server
npm run dev
```

#### 4. Khởi động Client Frontend (Terminal 3)

```bash
cd client
npm run dev
```

#### 5. Khởi động Admin Frontend (Terminal 4)

```bash
cd admin
npm run dev
```

## Testing

Project sử dụng **Jest** và **Supertest** cho backend testing, và **Vitest** cho frontend testing.

### 🧪 Server Testing

```bash
cd server

# Chạy tất cả tests
npm test

# Chạy tests theo loại
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only

# Watch mode (auto re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### 🧪 Admin Server Testing

```bash
cd admin_server

# Chạy tất cả tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### 🧪 Client Testing (Frontend)

```bash
cd client

# Chạy tất cả tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### 📊 Xem Coverage Report

Sau khi chạy tests với coverage, mở file HTML report:

```bash
# Server
cd server/coverage/lcov-report
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux

# Admin Server
cd admin_server/coverage/lcov-report
start index.html

# Client
cd client/coverage
start index.html
```

### 📝 Test Structure

```
server/__tests__/
├── unit/                    # Unit tests
│   ├── user.test.js
│   ├── product.test.js
│   └── cart.test.js
└── integration/             # Integration tests
    ├── auth.test.js
    └── api.test.js

admin_server/__test__/
├── unit/                    # Unit tests
│   ├── category.test.js
│   ├── order.test.js
│   └── admin.test.js
└── __mocks__/               # Mock data
    └── mockData.js
```

## CI/CD

Project sử dụng **GitHub Actions** để tự động chạy tests và checks khi có push hoặc pull request.

### 🔄 Workflows

#### 1. Server CI (`server-ci.yml`)
- Trigger: Push/PR vào `dev` hoặc `main` branch (changes in `server/`)
- Steps:
  - Checkout code
  - Setup Node.js 20.x
  - Install dependencies
  - Run tests với coverage
  - Upload coverage reports

#### 2. Admin Server CI (`admin-server-ci.yml`)
- Trigger: Push/PR vào `dev` hoặc `main` branch (changes in `admin_server/`)
- Steps:
  - Checkout code
  - Setup Node.js 20.x
  - Install dependencies
  - Run tests với coverage
  - Upload coverage reports

#### 3. Client CI (`client-ci.yml`)
- Trigger: Push/PR vào `dev` hoặc `main` branch (changes in `client/`)
- Steps:
  - Checkout code
  - Setup Node.js 20.x
  - Install dependencies
  - Run linting
  - Run tests với coverage
  - Build production

### ✅ Xem Kết Quả CI/CD

- Vào tab **Actions** trong GitHub repository
- Chọn workflow run để xem chi tiết
- Coverage reports được upload như artifacts

## API Endpoints

### 🔐 Authentication & User

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/user/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/api/user/login` | Đăng nhập | ❌ |
| GET | `/api/user/logout` | Đăng xuất | ✅ |
| GET | `/api/user/user-details` | Lấy thông tin user | ✅ |
| PUT | `/api/user/update-user` | Cập nhật thông tin user | ✅ |
| PUT | `/api/user/upload-avatar` | Upload avatar | ✅ |
| PUT | `/api/user/forgot-password` | Quên mật khẩu | ❌ |
| PUT | `/api/user/reset-password` | Reset mật khẩu | ❌ |
| POST | `/api/user/refresh-token` | Refresh access token | ✅ |

### 👨‍💼 Admin

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/admin/login` | Admin đăng nhập | ❌ |
| GET | `/api/admin/logout` | Admin đăng xuất | ✅ |
| GET | `/api/admin/users` | Lấy danh sách users | ✅ Admin |

### 📦 Category

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/category/add-category` | Thêm danh mục mới | ✅ Admin |
| GET | `/api/category/get` | Lấy danh sách danh mục | ❌ |
| PUT | `/api/category/update` | Cập nhật danh mục | ✅ Admin |
| DELETE | `/api/category/delete` | Xóa danh mục | ✅ Admin |

### 📂 SubCategory

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/subcategory/create` | Tạo danh mục con | ✅ Admin |
| POST | `/api/subcategory/get` | Lấy danh mục con | ❌ |
| PUT | `/api/subcategory/update` | Cập nhật danh mục con | ✅ Admin |
| DELETE | `/api/subcategory/delete` | Xóa danh mục con | ✅ Admin |

### 🛍️ Product

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/product/create` | Tạo sản phẩm mới | ✅ Admin |
| POST | `/api/product/get` | Lấy danh sách sản phẩm | ❌ |
| POST | `/api/product/get-product-by-category` | Lấy sản phẩm theo danh mục | ❌ |
| POST | `/api/product/get-product-details` | Chi tiết sản phẩm | ❌ |
| PUT | `/api/product/update-product-details` | Cập nhật sản phẩm | ✅ Admin |
| DELETE | `/api/product/delete-product` | Xóa sản phẩm | ✅ Admin |
| POST | `/api/product/search-product` | Tìm kiếm sản phẩm | ❌ |

### 🛒 Cart

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/cart/create` | Thêm sản phẩm vào giỏ | ✅ |
| GET | `/api/cart/get` | Lấy giỏ hàng | ✅ |
| PUT | `/api/cart/update-qty` | Cập nhật số lượng | ✅ |
| DELETE | `/api/cart/delete-cart-item` | Xóa khỏi giỏ hàng | ✅ |

### 📍 Address

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/address/create` | Tạo địa chỉ mới | ✅ |
| GET | `/api/address/get` | Lấy danh sách địa chỉ | ✅ |
| PUT | `/api/address/update` | Cập nhật địa chỉ | ✅ |
| DELETE | `/api/address/disable` | Vô hiệu hóa địa chỉ | ✅ |

### 📦 Order

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/order/cash-on-delivery` | Đặt hàng COD | ✅ |
| POST | `/api/order/checkout` | Thanh toán Stripe | ✅ |
| POST | `/api/order/vnpay-payment` | Thanh toán VNPAY | ✅ |
| GET | `/api/order/order-list` | Lịch sử đơn hàng | ✅ |
| GET | `/api/order/order-details/:id` | Chi tiết đơn hàng | ✅ |

### 📤 File Upload

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/file/upload` | Upload hình ảnh | ✅ |
| DELETE | `/api/file/delete` | Xóa hình ảnh | ✅ Admin |

## Tài Khoản Mặc Định

Hệ thống tự động tạo sẵn tài khoản khi khởi động lần đầu:

### 👨‍💼 Admin Account
```
Email: admin@gmail.com
Password: 123
Role: ADMIN
```

### 👤 User Account
```
Email: nguyenphuongvinh49@gmail.com
Password: 123
Role: USER
```

## Screenshots

![Demo 1](./Demo%201.gif)
![Demo 2](./Demo%202.gif)

## Troubleshooting

### ❌ Lỗi Kết Nối MongoDB

```bash
# Kiểm tra MongoDB đang chạy
mongod --version

# Hoặc sử dụng MongoDB Atlas cloud
# Update MONGODB_URI trong .env
```

### ❌ Lỗi Port Already in Use

```bash
# Windows - Tìm và kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### ❌ Lỗi Redis Connection

```bash
# Khởi động Redis
redis-server

# Hoặc với Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### ❌ Lỗi Dependencies

```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Cài lại
npm install

# Hoặc dùng npm ci để clean install
npm ci
```

### ❌ Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Chạy lại tests
npm test
```

### ❌ Docker Issues

```bash
# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Xem logs
docker-compose logs -f [service_name]
```

## Contributing

Chúng tôi rất hoan nghênh các đóng góp từ cộng đồng!

### Quy Trình Đóng Góp

1. **Fork repository**
   ```bash
   # Click nút Fork trên GitHub
   ```

2. **Clone fork của bạn**
   ```bash
   git clone https://github.com/your-username/Grocery-Store.git
   cd Grocery-Store
   ```

3. **Tạo branch mới**
   ```bash
   git checkout -b feature/amazing-feature
   # hoặc
   git checkout -b fix/bug-fix
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "Add: amazing feature description"
   ```

5. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Tạo Pull Request**
   - Vào GitHub repository
   - Click "New Pull Request"
   - Chọn branch của bạn
   - Điền mô tả chi tiết về changes

### Coding Standards

- ✅ Viết tests cho code mới
- ✅ Tuân thủ ESLint rules
- ✅ Comment code khi cần thiết
- ✅ Update documentation nếu thay đổi API
- ✅ Đảm bảo tất cả tests pass trước khi commit

### Commit Message Convention

```
Type: Subject (max 50 chars)

Add: Thêm tính năng mới
Fix: Sửa bug
Update: Cập nhật code/docs
Remove: Xóa code/file
Refactor: Tái cấu trúc code
Test: Thêm/sửa tests
Docs: Cập nhật documentation
```

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Liên Hệ

- 📧 **Email:** nguyenphuongvinh49@gmail.com
- 🐙 **GitHub:** [@Sog1n](https://github.com/Sog1n)
- 🔗 **Repository:** [Grocery-Store](https://github.com/Sog1n/Grocery-Store)

---

⭐ **Nếu project này hữu ích, hãy cho một star nhé!** ⭐
