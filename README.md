# 🛒 Grocery Store - Hệ Thống Cửa Hàng Tạp Hóa Trực Tuyến

![Banner](./Thumnails.png)

## Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [API Endpoints](#api-endpoints)
- [Tài Khoản Mặc Định](#tài-khoản-mặc-định)


## Giới Thiệu

Grocery Store là một hệ thống quản lý cửa hàng tạp hóa trực tuyến đầy đủ tính năng, được xây dựng với kiến trúc MERN Stack (MongoDB, Express.js, React, Node.js). Dự án cung cấp giải pháp toàn diện cho việc mua bán hàng hóa trực tuyến với giao diện người dùng thân thiện và hệ thống quản trị mạnh mẽ.

### Điểm Nổi Bật

- Giao diện hiện đại, responsive với Tailwind CSS
- Xác thực và phân quyền người dùng
- Quản lý giỏ hàng thời gian thực
- Tích hợp thanh toán VNPAY
- Quản lý đơn hàng chi tiết
- Hệ thống danh mục và danh mục con
- Tìm kiếm sản phẩm với full-text search
- Hỗ trợ Railway để kiểm thử hệ thống và triển khai toàn cục

## Tính Năng

### Người Dùng (Customer)
- Đăng ký và đăng nhập tài khoản
- Quên mật khẩu và khôi phục qua email
- Xem và tìm kiếm sản phẩm
- Lọc sản phẩm theo danh mục và danh mục con
- Thêm sản phẩm vào giỏ hàng
- Quản lý giỏ hàng (thêm, xóa, cập nhật số lượng)
- Quản lý địa chỉ giao hàng
- Đặt hàng và thanh toán (COD/VNPAY)
- Xem lịch sử đơn hàng
- Cập nhật thông tin cá nhân và avatar

### Quản Trị Viên (Admin)
- Quản lý danh mục và danh mục con
- Quản lý sản phẩm (CRUD) và trạng thái sản phẩm
- Upload và quản lý hình ảnh
- Quản lý đơn hàng
- Quản lý người dùng
- Xem thống kê và báo cáo (thêm sau)
- Dashboard quản lý tổng quan (thêm sau)

## Công Nghệ Sử Dụng

### Frontend
- **React 18.3.1** - Thư viện UI
- **Vite** - Build tool và dev server
- **React Router DOM** - Routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **SweetAlert2** - Alert/Dialog
- **Stripe.js** - Payment integration
- **TanStack Table** - Data tables

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload
- **Stripe** - Payment processing
- **Resend** - Email service
- **Helmet** - Security middleware
- **Morgan** - HTTP logger
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nodemon** - Development auto-reload
- **Railway** - Deployment and monitoring

## Cấu Trúc Dự Án

```
Grocery-Store/
├── client/                          # Frontend Application
│   ├── src/
│   │   ├── assets/                  # Images and static files
│   │   ├── common/                  # Common utilities
│   │   │   └── SummaryApi.js       # API endpoints configuration
│   │   ├── components/              # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CardProduct.jsx
│   │   │   ├── AddToCartButton.jsx
│   │   │   └── ...
│   │   ├── hooks/                   # Custom hooks
│   │   ├── layouts/                 # Layout components
│   │   ├── pages/                   # Page components
│   │   ├── provider/                # Context providers
│   │   ├── route/                   # Route configuration
│   │   ├── store/                   # Redux store
│   │   └── utils/                   # Utility functions
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend Application
│   ├── config/                      # Configuration files
│   │   ├── connectDB.js            # MongoDB connection
│   │   ├── sendEmail.js            # Email configuration
│   │   └── stripe.js               # Stripe configuration
│   ├── controllers/                 # Route controllers
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   └── ...
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js                 # Authentication
│   │   ├── Admin.js                # Admin authorization
│   │   └── multer.js               # File upload
│   ├── models/                      # Mongoose models
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   └── ...
│   ├── route/                       # API routes
│   │   ├── user.route.js
│   │   ├── product.route.js
│   │   ├── cart.route.js
│   │   └── ...
│   ├── utils/                       # Utility functions
│   │   ├── seedUsers.js            # Seed default users
│   │   ├── seedProducts.js         # Seed sample products
│   │   ├── uploadImageClodinary.js
│   │   └── ...
│   ├── Dockerfile
│   ├── index.js                     # Entry point
│   └── package.json
│
├── docker-compose.yml               # Docker compose configuration
├── Demo 1.gif                       # Demo screenshots
├── Demo 2.gif
└── README.md
```

## Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js >= 16.x
- MongoDB >= 5.x
- npm hoặc yarn
- Docker & Docker Compose (tùy chọn)


## Chạy Ứng Dụng (Local)

### Chạy Với Docker (Khuyến Nghị)

```bash
# Tạo file .env và cấu hình các biến môi trường
# Sau đó chạy:
docker-compose up -d
```

Ứng dụng sẽ chạy tại:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

## 📡 API Endpoints

### Authentication & User
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/user/register` | Đăng ký tài khoản |
| POST | `/api/user/login` | Đăng nhập |
| GET | `/api/user/logout` | Đăng xuất |
| GET | `/api/user/user-details` | Lấy thông tin user |
| PUT | `/api/user/update-user` | Cập nhật thông tin |
| PUT | `/api/user/upload-avatar` | Upload avatar |
| PUT | `/api/user/forgot-password` | Quên mật khẩu |
| PUT | `/api/user/reset-password` | Reset mật khẩu |
| POST | `/api/user/refresh-token` | Refresh token |

### Admin
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/admin/login` | Admin đăng nhập |
| GET | `/api/admin/logout` | Admin đăng xuất |

### Category
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/category/add-category` | Thêm danh mục |
| GET | `/api/category/get` | Lấy danh sách danh mục |
| PUT | `/api/category/update` | Cập nhật danh mục |
| DELETE | `/api/category/delete` | Xóa danh mục |

### SubCategory
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/subcategory/create` | Tạo danh mục con |
| POST | `/api/subcategory/get` | Lấy danh mục con |
| PUT | `/api/subcategory/update` | Cập nhật danh mục con |
| DELETE | `/api/subcategory/delete` | Xóa danh mục con |

### Product
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/product/create` | Tạo sản phẩm |
| POST | `/api/product/get` | Lấy danh sách sản phẩm |
| POST | `/api/product/get-product-by-category` | Lấy sản phẩm theo danh mục |
| POST | `/api/product/get-product-details` | Chi tiết sản phẩm |
| PUT | `/api/product/update-product-details` | Cập nhật sản phẩm |
| DELETE | `/api/product/delete-product` | Xóa sản phẩm |
| POST | `/api/product/search-product` | Tìm kiếm sản phẩm |

### Cart
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/cart/create` | Thêm vào giỏ hàng |
| GET | `/api/cart/get` | Lấy giỏ hàng |
| PUT | `/api/cart/update-qty` | Cập nhật số lượng |
| DELETE | `/api/cart/delete-cart-item` | Xóa khỏi giỏ hàng |

### Address
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/address/create` | Tạo địa chỉ |
| GET | `/api/address/get` | Lấy địa chỉ |
| PUT | `/api/address/update` | Cập nhật địa chỉ |
| DELETE | `/api/address/disable` | Vô hiệu hóa địa chỉ |

### Order
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/order/cash-on-delivery` | Đặt hàng COD |
| POST | `/api/order/checkout` | Thanh toán Stripe |
| GET | `/api/order/order-list` | Lịch sử đơn hàng |

### File Upload
| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/file/upload` | Upload hình ảnh |

## 👤 Tài Khoản Mặc Định

Hệ thống tự động tạo sẵn 2 tài khoản khi khởi động lần đầu:

### Admin Account
- **Email:** admin@gmail.com
- **Password:** 123
- **Role:** ADMIN

### User Account
- **Email:** nguyenphuongvinh49@gmail.com
- **Password:** 123
- **Role:** USER

## Screenshots

![Demo 1](./Demo%201.gif)
![Demo 2](./Demo%202.gif)

## Bảo Mật

- Mã hóa mật khẩu với bcrypt
- JWT cho authentication
- HTTP-only cookies cho refresh token
- Helmet.js cho HTTP headers security
- CORS configuration
- Input validation


## Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Build Production

### Frontend
```bash
cd client
npm run build
# Output: dist/
```

### Backend
```bash
cd server
npm start
```

## Triển Khai (Deployment)

### Sử Dụng Docker
```bash
docker-compose up -d --build
```


### Frontend - Backend (Railway)
- Cấu hình biến môi trường
- Push code lên platform
- Platform sẽ tự động build và deploy
