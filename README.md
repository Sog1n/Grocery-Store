# 🛒 Grocery Store - Hệ Thống Cửa Hàng Tạp Hóa Trực Tuyến

![Banner](./Thumnails.png)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📑 Mục Lục
- [Giới Thiệu](#-giới-thiệu)
- [Kiến Trúc Hệ Thống](#️-kiến-trúc-hệ-thống)
- [Tính Năng](#-tính-năng)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt & Chạy](#-cài-đặt--chạy)
- [Cấu Hình Môi Trường](#️-cấu-hình-môi-trường)
- [Testing](#-testing)
- [Docker & Docker Compose](#-docker--docker-compose)
- [Deployment](#-deployment)
  - [Deploy lên Railway](#deploy-lên-railway)
- [API Documentation](#-api-documentation)
- [Tài Khoản Demo](#-tài-khoản-demo)
- [Screenshots](#-screenshots)


## Giới Thiệu

Grocery Store là một hệ thống quản lý cửa hàng tạp hóa trực tuyến full-stack, được xây dựng với kiến trúc MERN Stack (MongoDB, Express.js, React, Node.js). Dự án cung cấp giải pháp toàn diện cho việc mua bán hàng hóa trực tuyến với giao diện người dùng thân thiện, hệ thống quản trị mạnh mẽ, và tính năng real-time với Socket.io và Redis.

### 🎯 Điểm Nổi Bật

#### 🏗️ Kiến Trúc & Công Nghệ
- ✅ **Microservices Architecture** - 4 services độc lập (Client, Server, Admin, Admin Server)
- ✅ **MERN Stack** - MongoDB, Express.js, React 18, Node.js
- ✅ **Real-time Communication** - Socket.io với Redis adapter cho scalability
- ✅ **Modern Frontend** - React 18.3.1 với Vite, Tailwind CSS, Redux Toolkit
- ✅ **RESTful API** - Express.js với proper HTTP methods và status codes
- ✅ **NoSQL Database** - MongoDB với Mongoose ODM
- ✅ **Containerization** - Docker & Docker Compose cho easy deployment

#### 🔐 Security & Authentication
- ✅ **JWT Authentication** - Access token & Refresh token mechanism
- ✅ **Password Encryption** - Bcrypt.js hashing với salt rounds
- ✅ **HTTP Security** - Helmet.js middleware protection
- ✅ **CORS Configuration** - Cross-origin resource sharing setup
- ✅ **Input Validation** - Sanitization và validation cho user inputs
- ✅ **Cookie Security** - HTTP-only cookies cho tokens

#### 💳 Payment Integration
- ✅ **Multiple Payment Methods** - COD, Stripe, VNPAY
- ✅ **Stripe Integration** - Checkout sessions, webhooks, refunds
- ✅ **VNPAY Gateway** - Vietnamese payment gateway với signature verification
- ✅ **Secure Transactions** - HMAC SHA512 signatures, SSL/TLS

#### 🚀 Performance & Scalability
- ✅ **Redis Caching** - Distributed caching cho Socket.io
- ✅ **Image Optimization** - Cloudinary CDN với automatic optimization
- ✅ **Database Indexing** - Optimized queries với proper indexes
- ✅ **Connection Pooling** - MongoDB connection pool management
- ✅ **Lazy Loading** - Code splitting và lazy loading components

#### 🧪 Testing & Quality
- ✅ **Unit Testing** - Jest cho backend controllers (55-75% coverage)
- ✅ **Integration Testing** - Supertest cho API endpoints
- ✅ **In-Memory Database** - MongoDB Memory Server cho tests
- ✅ **Mocking** - Jest mocks cho external dependencies
- ✅ **CI/CD Pipeline** - GitHub Actions automation

#### 📦 Features & Functionality
- ✅ **Product Management** - CRUD operations với image upload
- ✅ **Category System** - Hierarchical categories và subcategories
- ✅ **Shopping Cart** - Real-time cart management
- ✅ **Order Processing** - Complete order lifecycle management
- ✅ **User Management** - Registration, login, profile, addresses
- ✅ **Search & Filter** - Full-text search, price range, category filters
- ✅ **Email Notifications** - Transactional emails với Resend
- ✅ **Real-time Updates** - Socket.io notifications cho order status

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

#### Authentication & Profile
- ✅ **Đăng ký tài khoản** - Email verification với OTP
- ✅ **Đăng nhập/Đăng xuất** - JWT token authentication
- ✅ **Quên mật khẩu** - Reset password qua email với OTP
- ✅ **Cập nhật profile** - Thông tin cá nhân, avatar upload
- ✅ **Quản lý địa chỉ** - CRUD operations cho shipping addresses
- ✅ **Session management** - Automatic token refresh

#### Shopping Experience
- ✅ **Browse sản phẩm** - Grid/List view với pagination
- ✅ **Search sản phẩm** - Full-text search với highlights
- ✅ **Filter & Sort** - Theo category, subcategory, price range
- ✅ **Product details** - Images gallery, description, stock info
- ✅ **Related products** - Suggestions based on category
- ✅ **Giỏ hàng** - Add/remove/update quantity với validation
- ✅ **Stock check** - Real-time stock availability
- ✅ **Price calculation** - Subtotal, discount, shipping fee

#### Checkout & Payment
- ✅ **Multiple payment methods**:
  - 💵 **COD** - Cash on Delivery với address validation
  - 💳 **Stripe** - Credit/Debit card với Stripe Checkout
  - 🇻🇳 **VNPAY** - Vietnamese payment gateway
- ✅ **Address selection** - Choose from saved addresses
- ✅ **Order summary** - Review before payment
- ✅ **Payment verification** - Signature validation
- ✅ **Order confirmation** - Email notification

#### Order Management
- ✅ **Lịch sử đơn hàng** - All orders với filter by status
- ✅ **Order details** - Items, payment info, shipping info
- ✅ **Track order** - Real-time status updates
- ✅ **Cancel order** - Before processing với stock restoration
- ✅ **Reorder** - Quick reorder from history
- ✅ **Real-time notifications** - Socket.io order updates

### 👨‍💼 Quản Trị Viên (Admin)

#### Dashboard & Analytics
- ✅ **Overview dashboard** - Key metrics và statistics
- ✅ **Revenue reports** - Daily/Weekly/Monthly analytics
- ✅ **Product statistics** - Best sellers, low stock alerts
- ✅ **User analytics** - New users, active users
- ✅ **Order analytics** - Status breakdown, payment methods
- ✅ **Charts & Graphs** - Visual data representation

#### Product Management
- ✅ **Create products** - Multiple images, rich description
- ✅ **Edit products** - Update info, prices, stock
- ✅ **Delete products** - Soft delete với confirmation
- ✅ **Manage stock** - Inventory tracking
- ✅ **Publish/Unpublish** - Control product visibility
- ✅ **Bulk operations** - Multiple product actions
- ✅ **Image management** - Upload, reorder, delete images

#### Category Management
- ✅ **Categories CRUD** - Create, read, update, delete
- ✅ **SubCategories CRUD** - Hierarchical structure
- ✅ **Category ordering** - Custom sort order
- ✅ **Assign products** - Link products to categories
- ✅ **Category images** - Visual representation

#### Order Management
- ✅ **View all orders** - Filter, search, sort
- ✅ **Order details** - Full order information
- ✅ **Update status** - Processing → Shipped → Delivered
- ✅ **Cancel orders** - With reason và refund
- ✅ **Print invoice** - PDF generation
- ✅ **Refund management** - Stripe refunds
- ✅ **Real-time updates** - Notify customers via Socket.io

#### User Management
- ✅ **View users** - All registered users
- ✅ **User details** - Profile, orders, activity
- ✅ **Update roles** - USER/ADMIN permissions
- ✅ **Block/Unblock** - Account status management
- ✅ **Activity logs** - Track user actions

#### System Management
- ✅ **File upload** - Cloudinary integration
- ✅ **Email templates** - Customizable notifications
- ✅ **Settings** - System configuration
- ✅ **Logs viewer** - System và error logs

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
MONGO_INITDB_ROOT_USERNAME=your_mongodb_username
MONGO_INITDB_ROOT_PASSWORD=your_mongodb_password
MONGODB_URI=mongodb://localhost:27017/grocery_store

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
SECRET_KEY_ACCESS_TOKEN=generate_random_string_64_chars
SECRET_KEY_REFRESH_TOKEN=generate_random_string_64_chars

# 🔐 JWT Secrets - Admin
SECRET_KEY_ACCESS_TOKEN_ADMIN=generate_random_string_64_chars
SECRET_KEY_REFRESH_TOKEN_ADMIN=generate_random_string_64_chars

# ☁️ Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=get_from_cloudinary_dashboard
CLOUDINARY_API_KEY=get_from_cloudinary_dashboard
CLOUDINARY_API_SECRET=get_from_cloudinary_dashboard

# 📧 Email Service
RESEND_API=get_from_resend_com_dashboard

# 💳 Stripe Configuration
STRIPE_SECRET_KEY=sk_test_get_from_stripe_dashboard
VITE_STRIPE_PUBLIC_KEY=pk_test_get_from_stripe_dashboard
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_get_from_stripe_webhooks

# 💰 VNPAY Configuration (Optional)
VNP_TMN_CODE=get_from_vnpay_merchant_portal
VNP_HASH_SECRET=get_from_vnpay_merchant_portal
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/vnpay-return

# 🔧 Redis Configuration
REDIS_URL=redis://localhost:6379

# 🎯 API URLs
VITE_API_URL=http://localhost:8080
VITE_API_URL_ADMIN=http://localhost:8081

# 🔑 JWT Secret for Socket.io
JWT_SECRET=generate_random_string_64_chars
```

### 2. Server .env File

Tạo file `server/.env`:

```env
BACKEND_PORT=8080
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/grocery_store

# JWT (Generate random strings: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SECRET_KEY_ACCESS_TOKEN=generate_random_64_char_string
SECRET_KEY_REFRESH_TOKEN=generate_random_64_char_string

# Cloudinary (Get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Get from https://resend.com/api-keys)
RESEND_API=your_resend_api_key

# Stripe (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_xxx

# VNPAY (Optional - Get from VNPAY merchant portal)
VNP_TMN_CODE=your_merchant_code
VNP_HASH_SECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/vnpay-return

# Redis & Socket.io
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate_random_64_char_string
```

### 3. Admin Server .env File

Tạo file `admin_server/.env`:

```env
BACKEND_PORT=8081
FRONTEND_URL=http://localhost:5174
MONGODB_URI=mongodb://localhost:27017/grocery_store

# JWT (Admin - Generate different secrets from client)
SECRET_KEY_ACCESS_TOKEN=generate_random_64_char_string
SECRET_KEY_REFRESH_TOKEN=generate_random_64_char_string

# Cloudinary (Same as server)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Same as server)
RESEND_API=your_resend_api_key

# Stripe (Same as server)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_xxx

# Redis & Socket.io
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate_random_64_char_string
```

### 4. Client .env File

Tạo file `client/.env`:

```env
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx_from_stripe_dashboard
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

## 🚀 Deployment

Hệ thống Grocery Store có thể được deploy lên nhiều nền tảng cloud khác nhau. Dưới đây là hướng dẫn chi tiết cho từng platform.

---

## Deploy lên Railway

### 📋 Tổng Quan

Railway là nền tảng cloud deployment hiện đại với:
- ✅ Deploy tự động từ GitHub
- ✅ Managed Database (MongoDB, PostgreSQL, Redis)
- ✅ Free tier generous ($5 credit/tháng)
- ✅ SSL certificate tự động
- ✅ Custom domains
- ✅ Real-time logs và monitoring
- ✅ Zero downtime deployments

### 🎯 Kiến Trúc Deployment

```
Railway Project
├── 🗄️ MongoDB Database (Plugin)
├── 🔴 Redis Cache (Plugin)
├── 🖥️ Server (Client API) - Port 8080
├── 👨‍💼 Admin Server - Port 8081
├── 🌐 Client Frontend - Port 5173
└── 🎨 Admin Frontend - Port 5174
```

### 📝 Bước 1: Chuẩn Bị

#### 1.1. Tạo Tài Khoản Railway

1. Truy cập: https://railway.app/
2. Sign up với GitHub account
3. Verify email address
4. Nhận $5 free credit

#### 1.2. Fork/Clone Repository

```bash
# Clone repository
git clone https://github.com/Sog1n/Grocery-Store.git
cd Grocery-Store

# Hoặc fork repository về GitHub account của bạn
```

#### 1.3. Chuẩn Bị Environment Variables

Tạo file `.env.railway` để track các biến môi trường cần thiết:

```env
# Sẽ được configure trong Railway Dashboard
MONGODB_URI=<will-be-auto-generated>
REDIS_URL=<will-be-auto-generated>
SERVER_URL=<will-be-auto-generated>
ADMIN_SERVER_URL=<will-be-auto-generated>
CLIENT_URL=<will-be-auto-generated>
ADMIN_URL=<will-be-auto-generated>
```

---

### 🗄️ Bước 2: Setup Database Services

#### 2.1. Tạo New Project

1. Login vào Railway Dashboard
2. Click **"New Project"**
3. Đặt tên: `Grocery-Store-Production`

#### 2.2. Thêm MongoDB Database

**Option A: MongoDB Plugin (Khuyến nghị cho development)**

1. Trong Project, click **"New"** → **"Database"** → **"Add MongoDB"**
2. Railway tự động provision MongoDB instance
3. Connection string tự động tạo trong **Variables** tab:
   ```
   MONGO_URL=mongodb://mongo:xxxxxxxxxxxxx@mongodb.railway.internal:27017
   ```

**Option B: MongoDB Atlas (Khuyến nghị cho production)**

1. Tạo free cluster tại: https://www.mongodb.com/cloud/atlas/register
2. Create Database User:
   - Username: `grocery_admin`
   - Password: Generate strong password
3. Network Access: Add IP `0.0.0.0/0` (Allow from anywhere)
4. Get Connection String:
   ```
   mongodb+srv://grocery_admin:<password>@cluster0.xxxxx.mongodb.net/grocery_store?retryWrites=true&w=majority
   ```
5. Add vào Railway Environment Variables

#### 2.3. Thêm Redis Cache

1. Click **"New"** → **"Database"** → **"Add Redis"**
2. Railway tự động tạo Redis instance
3. Redis URL tự động available:
   ```
   REDIS_URL=redis://default:xxxxxxxx@redis.railway.internal:6379
   ```

---

### 🖥️ Bước 3: Deploy Backend Services

#### 3.1. Deploy Server (Client API)

##### Create Service

1. Click **"New"** → **"GitHub Repo"**
2. Select repository: `Grocery-Store`
3. **Root Directory**: `/server`
4. Service name: `grocery-server`

##### Configure Build & Deploy

Tạo file `server/railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm ci"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "server"

[services.env]
NODE_ENV = "production"
```

##### Environment Variables

Click vào **Server service** → **Variables** tab → Add:

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# Database (Reference từ MongoDB service)
MONGODB_URI=${{MongoDB.MONGO_URL}}
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Redis (Reference từ Redis service)
REDIS_URL=${{Redis.REDIS_URL}}

# Frontend URL (Sẽ update sau)
FRONTEND_URL=${{client.url}}

# JWT Secrets (Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SECRET_KEY_ACCESS_TOKEN=generate_random_64_char_string_here
SECRET_KEY_REFRESH_TOKEN=generate_different_random_64_char_string

# Cloudinary (Get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=get_from_cloudinary_console
CLOUDINARY_API_KEY=get_from_cloudinary_console
CLOUDINARY_API_SECRET=get_from_cloudinary_console

# Email Service (Get from https://resend.com/api-keys)
RESEND_API=get_from_resend_dashboard

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_from_stripe_dashboard
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_from_stripe_webhooks_section

# VNPAY (Get from VNPAY merchant portal)
VNP_TMN_CODE=get_from_vnpay_merchant_portal
VNP_HASH_SECRET=get_from_vnpay_merchant_portal
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=${{client.url}}/vnpay-return
```

**💡 Tips:**
- Use `${{service_name.VARIABLE_NAME}}` để reference variables giữa services
- Railway tự động inject `PORT` variable
- Tạo strong random secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

##### Generate Domain

1. **Settings** tab → **Networking** section
2. Click **"Generate Domain"**
3. Domain format: `grocery-server-production.up.railway.app`
4. Copy domain này để dùng cho Frontend

##### Deploy

1. **Deployments** tab → Click **"Deploy"**
2. Monitor build logs
3. Check deployment status → Should show ✅ Success
4. Test API: `https://your-server-domain.up.railway.app/api/health`

---

#### 3.2. Deploy Admin Server

##### Create Service

1. **New** → **GitHub Repo** → Select `Grocery-Store`
2. **Root Directory**: `/admin_server`
3. Service name: `grocery-admin-server`

##### Configure Build & Deploy

Tạo file `admin_server/railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm ci"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "admin-server"

[services.env]
NODE_ENV = "production"
```

##### Environment Variables

```env
# Server Configuration
PORT=8081
NODE_ENV=production

# Database (Reference MongoDB)
MONGODB_URI=${{MongoDB.MONGO_URL}}

# Redis (Reference Redis service)
REDIS_URL=${{Redis.REDIS_URL}}

# Frontend URL (Admin)
FRONTEND_URL=${{admin.url}}

# JWT Secrets (Admin - Generate DIFFERENT secrets from client server)
SECRET_KEY_ACCESS_TOKEN=generate_different_random_64_char_string
SECRET_KEY_REFRESH_TOKEN=generate_different_random_64_char_string

# Cloudinary (Same credentials as server)
CLOUDINARY_CLOUD_NAME=get_from_cloudinary_console
CLOUDINARY_API_KEY=get_from_cloudinary_console
CLOUDINARY_API_SECRET=get_from_cloudinary_console

# Email Service
RESEND_API=get_from_resend_dashboard

# Stripe (Same credentials as server)
STRIPE_SECRET_KEY=sk_live_from_stripe_dashboard
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_from_stripe_webhooks

# Redis
REDIS_URL=${{Redis.REDIS_URL}}
```

##### Generate Domain & Deploy

1. Generate domain: `grocery-admin-server-production.up.railway.app`
2. Deploy và monitor logs
3. Test API: `https://your-admin-server-domain.up.railway.app/api/health`

---

### 🌐 Bước 4: Deploy Frontend Services

#### 4.1. Deploy Client (Customer Frontend)

##### Create Service

1. **New** → **GitHub Repo** → `Grocery-Store`
2. **Root Directory**: `/client`
3. Service name: `grocery-client`

##### Configure Build & Deploy

Tạo file `client/railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm ci && npm run build"

[deploy]
startCommand = "npm run preview -- --host 0.0.0.0 --port $PORT"

[[services]]
name = "client"

[services.env]
NODE_ENV = "production"
```

##### Environment Variables

```env
# API URL (Reference Server service)
VITE_API_URL=${{server.url}}

# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

##### Generate Domain & Deploy

1. Generate domain: `grocery-store-client.up.railway.app`
2. Deploy
3. Access: `https://grocery-store-client.up.railway.app`

---

#### 4.2. Deploy Admin (Admin Frontend)

##### Create Service

1. **New** → **GitHub Repo** → `Grocery-Store`
2. **Root Directory**: `/admin`
3. Service name: `grocery-admin`

##### Configure Build & Deploy

Tạo file `admin/railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm ci && npm run build"

[deploy]
startCommand = "npm run preview -- --host 0.0.0.0 --port $PORT"

[[services]]
name = "admin"

[services.env]
NODE_ENV = "production"
```

##### Environment Variables

```env
# API URL (Reference Admin Server service)
VITE_API_URL=${{admin-server.url}}
```

##### Generate Domain & Deploy

1. Generate domain: `grocery-store-admin.up.railway.app`
2. Deploy
3. Access: `https://grocery-store-admin.up.railway.app`

---

### 🔧 Bước 5: Cấu Hình CORS và URLs

#### 5.1. Update Server CORS

Trong `server/index.js`, update CORS configuration:

```javascript
const allowedOrigins = [
  'https://grocery-store-client.up.railway.app',
  'https://grocery-store-admin.up.railway.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

#### 5.2. Update Frontend URLs

Quay lại Server và Admin Server services, update:

```env
# Server service
FRONTEND_URL=https://grocery-store-client.up.railway.app

# Admin Server service  
FRONTEND_URL=https://grocery-store-admin.up.railway.app
```

#### 5.3. Update Webhook URLs

##### Stripe Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-server-domain.up.railway.app/api/webhook/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret → Update `STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY`

##### VNPAY Return URL

Update trong Admin Server:
```env
VNP_RETURN_URL=https://grocery-store-client.up.railway.app/vnpay-return
```

---

### 🎯 Bước 6: Testing & Monitoring

#### 6.1. Health Checks

Test tất cả services:

```bash
# Server Health Check
curl https://your-server-domain.up.railway.app/api/health

# Admin Server Health Check
curl https://your-admin-server-domain.up.railway.app/api/health

# Client
curl https://grocery-store-client.up.railway.app

# Admin
curl https://grocery-store-admin.up.railway.app
```

#### 6.2. Monitor Logs

Railway Dashboard → Each Service → **Deployments** tab:
- View real-time logs
- Check for errors
- Monitor performance

#### 6.3. Test Functionality

- [ ] User registration và login
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout với COD
- [ ] Checkout với Stripe
- [ ] Checkout với VNPAY
- [ ] Admin login
- [ ] Create/Edit products
- [ ] Manage orders
- [ ] Upload images
- [ ] Email notifications
- [ ] Real-time order updates

---

### 🌐 Bước 7: Custom Domain (Optional)

#### 7.1. Mua Domain

Từ providers như: Namecheap, GoDaddy, Cloudflare

#### 7.2. Configure DNS

Trong DNS provider, tạo CNAME records:

```
Type    Name        Value
CNAME   www         grocery-store-client.up.railway.app
CNAME   api         grocery-server-production.up.railway.app
CNAME   admin       grocery-store-admin.up.railway.app
CNAME   admin-api   grocery-admin-server-production.up.railway.app
```

#### 7.3. Add Custom Domain trong Railway

1. Select service → **Settings** → **Networking**
2. **Custom Domain** section → Enter domain
3. Railway verify DNS records
4. SSL certificate tự động issue

Example domains:
- Client: `www.yourdomain.com` hoặc `shop.yourdomain.com`
- API: `api.yourdomain.com`
- Admin: `admin.yourdomain.com`
- Admin API: `admin-api.yourdomain.com`

---

### 📊 Bước 8: Monitoring & Scaling

#### 8.1. Railway Metrics

Dashboard cung cấp:
- **CPU Usage**: Monitor resource consumption
- **Memory Usage**: RAM utilization
- **Network**: Bandwidth usage
- **Response Time**: API latency
- **Error Rate**: Failed requests

#### 8.2. Auto-scaling

Railway tự động scale based on:
- Traffic load
- Memory usage
- CPU utilization

Configure trong **Settings** → **Resources**:
- **Replicas**: Number of instances (1-10)
- **Memory**: 512MB - 8GB
- **CPU**: Shared - Dedicated

#### 8.3. Logs & Alerts

Setup notifications:
1. **Settings** → **Notifications**
2. Add webhook URL hoặc email
3. Configure alerts cho:
   - Deployment failures
   - High error rates
   - Resource limits

---

### 💰 Bước 9: Cost Optimization

#### 9.1. Free Tier Usage

Railway free tier includes:
- $5 credit/month
- 500 hours execution time
- 100GB outbound bandwidth
- Shared CPU
- 512MB RAM per service

#### 9.2. Optimization Tips

**Reduce Build Time:**
```bash
# Use npm ci instead of npm install
# Enable caching in railway.toml
[build]
buildCommand = "npm ci --prefer-offline"
```

**Optimize Images:**
```bash
# Use multi-stage Docker builds
# Minimize node_modules size
npm prune --production
```

**Database Optimization:**
- Use indexes cho frequent queries
- Implement pagination
- Cache với Redis
- Use MongoDB Atlas M0 free tier

**CDN for Static Assets:**
- Cloudinary cho images
- Railway CDN cho static files

---

### ✅ Deployment Checklist

#### Pre-deployment

- [ ] All environment variables prepared
- [ ] MongoDB connection string ready
- [ ] Stripe API keys configured
- [ ] VNPAY credentials ready
- [ ] Cloudinary account setup
- [ ] Resend API key obtained
- [ ] Repository pushed to GitHub

#### Database Setup

- [ ] MongoDB service created (Plugin hoặc Atlas)
- [ ] Redis service added
- [ ] Database connection tested
- [ ] Indexes created
- [ ] Seed data loaded (optional)

#### Backend Deployment

- [ ] Server service deployed
- [ ] Admin Server service deployed
- [ ] Health checks passing
- [ ] Environment variables configured
- [ ] CORS origins updated
- [ ] Webhook endpoints configured

#### Frontend Deployment

- [ ] Client service deployed
- [ ] Admin service deployed
- [ ] API URLs configured correctly
- [ ] Build successful
- [ ] Static assets loading

#### Post-deployment

- [ ] All URLs updated (CORS, webhooks, returns)
- [ ] SSL certificates active
- [ ] Custom domains configured (if applicable)
- [ ] All features tested
- [ ] Monitoring setup
- [ ] Logs reviewed
- [ ] Error tracking configured

---

### 🐛 Troubleshooting Railway

#### Common Issues

**1. Build Failures**

```bash
# Check logs in Deployments tab
# Common fixes:
- Verify package.json scripts
- Check Node.js version compatibility
- Ensure all dependencies in package.json
- Clear Railway cache and redeploy
```

**2. Connection Refused**

```bash
# Ensure correct PORT usage
const PORT = process.env.PORT || 8080;

# Railway automatically assigns PORT
# Don't hardcode port numbers
```

**3. Database Connection Errors**

```bash
# Check MongoDB connection string
# Verify MongoDB IP whitelist (0.0.0.0/0)
# Test connection locally first
# Check network access settings
```

**4. CORS Errors**

```javascript
// Ensure frontend URL in CORS origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://your-railway-domain.up.railway.app'
];
```

**5. Environment Variables Not Loading**

```bash
# Verify variables in Railway dashboard
# Check variable names (case-sensitive)
# Restart service after adding variables
# Use ${{service.VARIABLE}} for references
```

**6. Out of Memory**

```bash
# Increase memory limit in Settings
# Optimize code (memory leaks)
# Use pagination for large datasets
# Implement caching
```

---

### 📚 Additional Resources

#### Railway Documentation

- Official Docs: https://docs.railway.app/
- Deployment Guide: https://docs.railway.app/deploy/deployments
- Environment Variables: https://docs.railway.app/develop/variables
- Custom Domains: https://docs.railway.app/deploy/domains

#### Community Support

- Railway Discord: https://discord.gg/railway
- GitHub Discussions: https://github.com/railwayapp/railway/discussions
- Stack Overflow: Tag `railway`

---

---

## 🐳 Docker & Docker Compose

### Local Development với Docker

```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy ở background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop tất cả services
docker-compose down

# Stop và xóa volumes
docker-compose down -v
```

### Docker Hub Deployment

```bash
# Build images
docker build -t yourusername/grocery-server:latest ./server
docker build -t yourusername/grocery-admin-server:latest ./admin_server
docker build -t yourusername/grocery-client:latest ./client
docker build -t yourusername/grocery-admin:latest ./admin

# Push to Docker Hub
docker push yourusername/grocery-server:latest
docker push yourusername/grocery-admin-server:latest
docker push yourusername/grocery-client:latest
docker push yourusername/grocery-admin:latest
```

---

## 📊 Monitoring & Analytics

### Application Monitoring

**Railway Built-in Metrics:**
- CPU usage
- Memory consumption
- Network traffic
- Response times
- Error rates

**External Tools:**
- **Sentry**: Error tracking và monitoring
- **LogRocket**: Session replay
- **Google Analytics**: User analytics
- **Mixpanel**: Product analytics

### Setup Sentry

```bash
npm install @sentry/react @sentry/node

# Frontend (React)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});

# Backend (Node.js)
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

---

## 🔐 Security Best Practices

### Production Security Checklist

#### Environment Variables
- [ ] Không commit .env files
- [ ] Use strong random secrets (>32 characters)
- [ ] Rotate secrets định kỳ
- [ ] Use different secrets cho dev/staging/production

#### Database Security
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords
- [ ] Whitelist IPs carefully
- [ ] Enable MongoDB encryption at rest
- [ ] Regular backups
- [ ] Use connection pooling

#### API Security
- [ ] Implement rate limiting
- [ ] Use HTTPS only
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Implement CSRF protection
- [ ] Use helmet.js middleware
- [ ] Enable CORS properly

#### Authentication
- [ ] Use JWT with short expiration
- [ ] Implement refresh tokens
- [ ] Hash passwords with bcrypt (10+ rounds)
- [ ] Implement account lockout
- [ ] Enable 2FA (optional)

#### File Upload
- [ ] Validate file types
- [ ] Limit file sizes
- [ ] Scan for malware
- [ ] Use CDN (Cloudinary)
- [ ] Don't store locally in production

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "60d5ec49f1b2c72b8c8e4f1a"
  }
}
```

#### Login
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/product?page=1&limit=20&category=fruits&search=apple&sort=price&order=asc
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 100,
      "limit": 20
    }
  }
}
```

#### Create Product (Admin)
```http
POST /api/product
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Form Data:
- name: "Fresh Apple"
- description: "Organic red apples"
- price: 50000
- unit: "kg"
- stock: 100
- category: "60d5ec49f1b2c72b8c8e4f1a"
- images: [file1, file2, file3]

Response: 201 Created
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "productId": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Fresh Apple",
    "images": [
      "https://res.cloudinary.com/xxx/image1.jpg",
      "https://res.cloudinary.com/xxx/image2.jpg"
    ]
  }
}
```

### Order Endpoints

#### Create Order
```http
POST /api/order/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "60d5ec49f1b2c72b8c8e4f1a",
      "quantity": 2,
      "price": 50000
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "0123456789",
    "address": "123 Main St",
    "district": "District 1",
    "city": "Ho Chi Minh"
  },
  "paymentMethod": "COD",
  "totalAmount": 100000
}

Response: 201 Created
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "60d5ec49f1b2c72b8c8e4f1a",
    "orderNumber": "ORD-20250611-001",
    "status": "PENDING",
    "totalAmount": 100000,
    "paymentMethod": "COD"
  }
}
```

#### Stripe Payment
```http
POST /api/payment/stripe/create-checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "60d5ec49f1b2c72b8c8e4f1a",
  "amount": 100000,
  "currency": "vnd"
}

Response: 200 OK
{
  "success": true,
  "message": "Checkout session created",
  "data": {
    "sessionId": "cs_test_xxxxxxxxxxxxx",
    "url": "https://checkout.stripe.com/pay/cs_test_xxxxxxxxxxxxx"
  }
}
```

**📖 Full API Documentation:** [Xem thêm tại docs folder](./docs/API.md)

---

## 🎯 Tài Khoản Demo

### Customer Account
```
Email: customer@demo.com
Password: Demo@123456
```

### Admin Account
```
Email: admin@demo.com
Password: Admin@123456
```

**⚠️ Lưu ý:** Đây là tài khoản demo. Vui lòng không thay đổi thông tin quan trọng.

---

## 📸 Screenshots

### Customer Interface

#### Homepage
![Homepage](./screenshots/homepage.png)

#### Product Details
![Product Details](./screenshots/product-details.png)

#### Shopping Cart
![Shopping Cart](./screenshots/cart.png)

#### Checkout
![Checkout](./screenshots/checkout.png)

### Admin Dashboard

#### Dashboard Overview
![Dashboard](./screenshots/admin-dashboard.png)

#### Product Management
![Products](./screenshots/admin-products.png)

#### Order Management
![Orders](./screenshots/admin-orders.png)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

```bash
Error: MongooseServerSelectionError: connect ECONNREFUSED

# Solutions:
- Check MongoDB service is running
- Verify MONGODB_URI in .env
- Check network/firewall settings
- Whitelist IP in MongoDB Atlas
```

#### 2. CORS Error

```bash
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:5173' 
has been blocked by CORS policy

# Solutions:
- Add frontend URL to CORS configuration
- Check FRONTEND_URL environment variable
- Verify credentials: true in cors config
```

#### 3. Redis Connection Failed

```bash
Error: Redis connection to localhost:6379 failed

# Solutions:
- Check Redis service is running: redis-cli ping
- Verify REDIS_URL environment variable
- Start Redis: redis-server (Unix) or redis-server.exe (Windows)
```

#### 4. File Upload Error

```bash
Error: Cloudinary configuration error

# Solutions:
- Verify Cloudinary credentials in .env
- Check API key permissions
- Ensure file size within limits
- Check file type restrictions
```

#### 5. Payment Webhook Not Working

```bash
Stripe webhook signature verification failed

# Solutions:
- Check STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY
- Verify webhook endpoint URL
- Test webhook locally with Stripe CLI
- Check if endpoint is publicly accessible
```

#### 6. Socket.io Connection Issues

```bash
WebSocket connection failed

# Solutions:
- Check Redis connection
- Verify CORS configuration for Socket.io
- Check firewall blocking WebSocket
- Ensure client connects to correct server URL
```

---

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết chi tiết.

### Development Workflow

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

### Code Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Keep code DRY (Don't Repeat Yourself)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors & Contributors

- **Sog1n** - *Initial work* - [GitHub](https://github.com/Sog1n)

See also the list of [contributors](https://github.com/Sog1n/Grocery-Store/contributors) who participated in this project.

---

## 🙏 Acknowledgments

- React team for amazing framework
- MongoDB team for excellent database
- Stripe & VNPAY for payment gateways
- Cloudinary for image hosting
- Railway for deployment platform
- All open-source contributors

---

## 📞 Support

- **Email**: support@grocerystore.com
- **GitHub Issues**: [Create an issue](https://github.com/Sog1n/Grocery-Store/issues)
- **Documentation**: [Wiki](https://github.com/Sog1n/Grocery-Store/wiki)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-language support

### Q2 2025
- [ ] Loyalty program
- [ ] Referral system
- [ ] AI product recommendations
- [ ] Voice search

### Q3 2025
- [ ] Merchant platform
- [ ] Delivery tracking
- [ ] Live chat support
- [ ] Progressive Web App (PWA)

---

<div align="center">

**⭐ Star us on GitHub — it motivates us a lot!**

Made with ❤️ by [Sog1n](https://github.com/Sog1n)

[⬆ Back to top](#-grocery-store---hệ-thống-cửa-hàng-tạp-hóa-trực-tuyến)

</div>

#### Bước 2: Deploy Backend Services

##### Deploy Server (Client API)

```bash
# 1. Tạo New Project trên Railway
# 2. Deploy from GitHub repo
# 3. Chọn thư mục: /server
# 4. Thiết lập biến môi trường
```

**Environment Variables cho Server:**
```env
# Database
MONGODB_URI=get_from_mongodb_atlas_or_railway_plugin

# Server
PORT=8080
FRONTEND_URL=https://your-client-app.railway.app

# JWT (Generate strong random strings)
JWT_SECRET_KEY=generate_random_64_char_string
REFRESH_TOKEN_SECRET_KEY=generate_random_64_char_string

# Cloudinary (Get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=from_cloudinary_dashboard
CLOUDINARY_API_KEY=from_cloudinary_dashboard
CLOUDINARY_API_SECRET=from_cloudinary_dashboard

# Email (Get from resend.com)
RESEND_API=from_resend_dashboard

# Stripe (Get from stripe.com)
STRIPE_SECRET_KEY=sk_live_from_stripe_dashboard
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_from_stripe_webhooks

# VNPAY (Optional)
VNP_TMN_CODE=from_vnpay_merchant_portal
VNP_HASH_SECRET=from_vnpay_merchant_portal
VNP_URL=https://vnpay.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=https://your-client-app.railway.app/vnpay-return

# Redis (Use Railway variable reference)
REDIS_URL=${{Redis.REDIS_URL}}
```

**Railway Configuration File** (Tạo `railway.toml` trong `/server`):
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

##### Deploy Admin Server

```bash
# 1. Tạo Service mới trong cùng Project
# 2. Deploy from GitHub repo
# 3. Chọn thư mục: /admin_server
# 4. Thiết lập biến môi trường
```

**Environment Variables cho Admin Server:**
```env
# Database
MONGODB_URI=get_from_mongodb_atlas_or_railway_plugin

# Server
PORT=8081
FRONTEND_URL=https://your-admin-app.railway.app

# JWT (Admin - Use DIFFERENT secrets from client server)
SECRET_KEY_ACCESS_TOKEN=generate_different_random_string
SECRET_KEY_REFRESH_TOKEN=generate_different_random_string

# Cloudinary (Same as server)
CLOUDINARY_CLOUD_NAME=from_cloudinary_dashboard
CLOUDINARY_API_KEY=from_cloudinary_dashboard
CLOUDINARY_API_SECRET=from_cloudinary_dashboard

# Email (Same as server)
RESEND_API=from_resend_dashboard

# Stripe (Same as server)
STRIPE_SECRET_KEY=sk_live_from_stripe_dashboard
STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY=whsec_from_stripe_webhooks

# Redis (Get from Railway Redis plugin)
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Bước 3: Deploy Frontend Services

##### Deploy Client (Customer Frontend)

```bash
# 1. Tạo Service mới cho Client
# 2. Deploy from GitHub repo
# 3. Chọn thư mục: /client
```

**Environment Variables cho Client:**
```env
VITE_API_URL=https://your-server-api.railway.app
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
```

**Railway Configuration** (`railway.toml` trong `/client`):
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run preview"
```

##### Deploy Admin (Admin Frontend)

```bash
# 1. Tạo Service mới cho Admin
# 2. Deploy from GitHub repo
# 3. Chọn thư mục: /admin
```

**Environment Variables cho Admin:**
```env
VITE_API_URL=https://your-admin-server-api.railway.app
```

#### Bước 4: Deploy Database Services

##### MongoDB

**Option 1: MongoDB Atlas (Khuyến nghị)**
```bash
# 1. Tạo cluster miễn phí tại: https://www.mongodb.com/cloud/atlas
# 2. Tạo database user
# 3. Whitelist IP: 0.0.0.0/0 (cho phép mọi IP)
# 4. Copy connection string
# 5. Update MONGODB_URI trong Railway env vars
```

**Option 2: Railway MongoDB Plugin**
```bash
# 1. Vào Railway Project
# 2. Click "New" -> "Database" -> "MongoDB"
# 3. Railway sẽ tự động tạo MONGODB_URI
# 4. Reference variable trong các services khác
```

##### Redis

```bash
# 1. Vào Railway Project
# 2. Click "New" -> "Database" -> "Redis"
# 3. Railway tự động tạo REDIS_URL
# 4. Reference variable trong Server và Admin Server
```

#### Bước 5: Cấu Hình Domain và SSL

```bash
# 1. Mỗi service có domain mặc định: xxx.railway.app
# 2. Settings -> Generate Domain (nếu chưa có)
# 3. Custom Domain (tùy chọn):
#    - Settings -> Custom Domain
#    - Thêm CNAME record trong DNS provider
# 4. SSL tự động được cấp bởi Railway
```

#### Bước 6: Monitoring và Logs

```bash
# Railway Dashboard cung cấp:
# - Real-time logs: Deployments tab
# - Metrics: CPU, Memory, Network
# - Deploy history
# - Environment variables management
```

#### Checklist Deploy Railway

- [ ] MongoDB Atlas/Railway MongoDB đã setup
- [ ] Redis Plugin đã thêm vào project
- [ ] Server deployed và có domain
- [ ] Admin Server deployed và có domain
- [ ] Client deployed với VITE_API_URL đúng
- [ ] Admin deployed với VITE_API_URL đúng
- [ ] Tất cả environment variables đã set
- [ ] CORS origins đã cấu hình đúng
- [ ] Webhook URLs đã update (Stripe, VNPAY)
- [ ] Test tất cả các tính năng
- [ ] Monitor logs để kiểm tra errors

### 🌐 Deploy với Vercel (Alternative)

Vercel phù hợp cho frontend và serverless functions.

#### Deploy Frontend

```bash
# Client
cd client
vercel --prod

# Admin
cd admin
vercel --prod
```

**Environment Variables trên Vercel:**
```env
VITE_API_URL=https://your-api-url.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

#### Deploy Backend (Serverless)

Tạo file `vercel.json` trong `/server`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

```bash
cd server
vercel --prod
```

### 🐳 Deploy với Docker (Production)

#### Bước 1: Build Production Images

```bash
# Build tất cả services
docker-compose -f docker-compose.prod.yml build

# Hoặc build từng service
docker build -t grocery-server:prod ./server
docker build -t grocery-admin-server:prod ./admin_server
docker build -t grocery-client:prod ./client
docker build -t grocery-admin:prod ./admin
```

#### Bước 2: Push Images lên Registry

```bash
# Docker Hub
docker tag grocery-server:prod username/grocery-server:latest
docker push username/grocery-server:latest

# Google Container Registry
docker tag grocery-server:prod gcr.io/project-id/grocery-server:latest
docker push gcr.io/project-id/grocery-server:latest

# AWS ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account-id.dkr.ecr.region.amazonaws.com
docker tag grocery-server:prod account-id.dkr.ecr.region.amazonaws.com/grocery-server:latest
docker push account-id.dkr.ecr.region.amazonaws.com/grocery-server:latest
```

#### Bước 3: Deploy trên Server

```bash
# Pull images
docker pull username/grocery-server:latest

# Run với docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Scale services nếu cần
docker-compose up -d --scale backend_client=3
```

#### Docker Production Configuration

Tạo `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - grocery_network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - grocery_network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  backend_client:
    image: grocery-server:prod
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      - mongodb
      - redis
    networks:
      - grocery_network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G

  backend_admin:
    image: grocery-admin-server:prod
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      - mongodb
      - redis
    networks:
      - grocery_network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  frontend_client:
    image: grocery-client:prod
    restart: always
    networks:
      - grocery_network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  frontend_admin:
    image: grocery-admin:prod
    restart: always
    networks:
      - grocery_network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend_client
      - frontend_admin
      - backend_client
      - backend_admin
    networks:
      - grocery_network

networks:
  grocery_network:
    driver: bridge

volumes:
  mongodb_data:
  mongodb_config:
  redis_data:
```

#### Nginx Configuration

Tạo `nginx.conf` cho reverse proxy:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend_client {
        server backend_client:8080;
    }

    upstream backend_admin {
        server backend_admin:8081;
    }

    upstream frontend_client {
        server frontend_client:5173;
    }

    upstream frontend_admin {
        server frontend_admin:5174;
    }

    # Client Application
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://frontend_client;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://backend_client;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /socket.io {
            proxy_pass http://backend_client;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }

    # Admin Application
    server {
        listen 80;
        server_name admin.your-domain.com;

        location / {
            proxy_pass http://frontend_admin;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://backend_admin;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /socket.io {
            proxy_pass http://backend_admin;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

### 📊 Production Best Practices

#### Security
- ✅ Sử dụng HTTPS cho tất cả connections
- ✅ Set proper CORS origins (không dùng *)
- ✅ Enable Helmet.js security headers
- ✅ Validate và sanitize tất cả user inputs
- ✅ Rate limiting cho APIs
- ✅ Không commit .env files
- ✅ Rotate JWT secrets định kỳ
- ✅ Enable MongoDB authentication

#### Performance
- ✅ Enable Redis caching
- ✅ Optimize images với Cloudinary
- ✅ Minify và compress assets
- ✅ Enable CDN cho static files
- ✅ Database indexing cho queries thường dùng
- ✅ Implement pagination cho large datasets
- ✅ Use connection pooling

#### Monitoring
- ✅ Setup error tracking (Sentry)
- ✅ Monitor uptime (UptimeRobot)
- ✅ Log aggregation (Logtail, Papertrail)
- ✅ Performance monitoring (New Relic, Datadog)
- ✅ Setup alerts cho critical errors

#### Backup
- ✅ Automated MongoDB backups
- ✅ Backup Cloudinary assets
- ✅ Version control cho code
- ✅ Database migration scripts
- ✅ Disaster recovery plan

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

> ⚠️ **Lưu ý**: Thay đổi mật khẩu mặc định ngay sau khi deploy production!

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
