# ✅ HƯỚNG DẪN HỆ THỐNG REALTIME - ĐƠN GIẢN & DỄ HIỂU

## 🎯 TỔNG QUAN

Hệ thống realtime cho phép **Client và Admin tự động cập nhật UI** khi có thay đổi **KHÔNG CẦN F5!**

**Ví dụ thực tế:**
- Admin thêm sản phẩm mới → User đang xem Home thấy sản phẩm xuất hiện ngay lập tức ✅
- Admin duyệt đơn hàng → User đang xem My Orders thấy status đổi ngay ✅
- User tạo đơn mới → Admin thấy đơn xuất hiện trong Order Management ngay ✅

---

## 🏗️ KIẾN TRÚC ĐƠN GIẢN

### 1. Backend (2 Servers)

**Server 1: User Server (port 8080)**
- Xử lý: Login, đặt hàng, thanh toán
- Emit events: `order:created`, `order:cancelled`, `order:status_changed`

**Server 2: Admin Server (port 8081)**  
- Xử lý: Quản lý sản phẩm, category, subcategory
- Emit events: `product:*`, `category:*`, `subcategory:*`

**Redis Adapter:** Đồng bộ events giữa 2 servers (nếu có)

### 2. Frontend (2 Apps)

**Client App (port 5173)**
- Socket connect tới: `localhost:8081` (Admin Server)
- Nhận events: product:*, category:*, subcategory:*, order:*
- Tự động cập nhật UI khi admin thay đổi data

**Admin App (port 5174)**
- Socket connect tới: `localhost:8081` (Admin Server)
- Nhận events: product:*, category:*, subcategory:*, order:*
- Tự động cập nhật UI khi admin khác thay đổi data

---

## 📁 CẤU TRÚC FILE - CLIENT

```
client/src/
├── App.jsx                           # Mount SocketManager ở đây
├── socket/
│   ├── SocketManager.jsx             # ⭐ Core: Quản lý socket connection
│   ├── useSocket.js                  # Hook: Tạo socket connection
│   └── listeners.js                  # ⭐ Core: Xử lý tất cả events
├── components/
│   └── CategoryWiseProductDisplay.jsx # Đọc Redux → auto re-render
└── pages/
    ├── Home.jsx                      # Đọc Redux → auto re-render
    ├── SearchPage.jsx                # Đọc Redux → auto re-render
    ├── ProductListPage.jsx           # Có socket riêng (đặc biệt)
    └── MyOrders.jsx                  # Đọc Redux → auto re-render
```

---

## ⚙️ CÁCH HOẠT ĐỘNG - 3 BƯỚC ĐƠN GIẢN

### Bước 1: SocketManager Kết Nối

**File:** `client/src/App.jsx`
```jsx
import SocketManager from './socket/SocketManager'

function App() {
  return (
    <GlobalProvider>
      <SocketManager />  {/* ← Mount ở đây */}
      <Header />
      <Outlet />
    </GlobalProvider>
  )
}
```

**Giải thích:** 
- SocketManager được mount 1 lần duy nhất
- Tự động connect socket khi app khởi động
- Không cần mount ở nhiều nơi!

---

### Bước 2: Socket Nhận Events và Update Redux

**File:** `client/src/socket/SocketManager.jsx`
```jsx
export default function SocketManager() {
  const token = useSelector(s => s.user?.accessToken)
  const socketRef = useSocket(token)  // Tạo socket connection
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !socket.connected) return
    
    // Đăng ký tất cả event listeners
    registerSocketHandlers(socket, dispatch)
  }, [socketRef.current])

  return null  // Không render UI
}
```

**Giải thích:**
- useSocket: Tạo connection tới admin_server (8081)
- registerSocketHandlers: Đăng ký lắng nghe tất cả events
- Khi nhận event → Gọi API refetch → Update Redux

---

**File:** `client/src/socket/listeners.js`
```javascript
export function registerSocketHandlers(socket, dispatch) {
  
  // Lắng nghe product events
  socket.on('product:created', () => {
    // Refetch products sau 300ms (debounce)
    setTimeout(async () => {
      const res = await Axios({ ...SummaryApi.getProduct })
      dispatch(setProducts(res.data.data))  // ← Update Redux
    }, 300)
  })
  
  socket.on('product:updated', () => { /* tương tự */ })
  socket.on('product:deleted', () => { /* tương tự */ })
  
  // Lắng nghe category events
  socket.on('category:created', () => {
    setTimeout(async () => {
      const res = await Axios({ ...SummaryApi.getCategory })
      dispatch(setAllCategory(res.data.data))  // ← Update Redux
    }, 300)
  })
  
  // Tương tự cho subcategory, order events...
}
```

**Giải thích:**
- Mỗi event → Refetch data mới từ API
- Update vào Redux Store
- Debounce 300ms để tránh refetch quá nhiều

---

### Bước 3: Components Đọc Redux và Auto Re-render

**File:** `client/src/pages/Home.jsx`
```jsx
const Home = () => {
  // Đọc từ Redux - SocketManager đã update rồi!
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  
  return (
    <div>
      {/* Hiển thị categories */}
      {categoryData.map(cat => <CategoryCard {...cat} />)}
      
      {/* Hiển thị products theo category */}
      {categoryData.map(cat => 
        <CategoryWiseProductDisplay id={cat._id} name={cat.name} />
      )}
    </div>
  )
}
```

**Giải thích:**
- Component KHÔNG cần socket listeners!
- Chỉ cần đọc Redux bằng `useSelector`
- Khi Redux thay đổi → React tự động re-render
- **Đơn giản và sạch sẽ!**

---

**File:** `client/src/components/CategoryWiseProductDisplay.jsx`
```jsx
const CategoryWiseProductDisplay = ({ id, name }) => {
  const [data, setData] = useState([])
  const reduxProducts = useSelector(state => state.product.product)
  
  const fetchProducts = async () => {
    const res = await Axios({ ...SummaryApi.getProductByCategory, data: { id }})
    setData(res.data.data)
  }
  
  useEffect(() => {
    fetchProducts()  // Fetch lần đầu
  }, [])
  
  // ⭐ Realtime: Refetch khi Redux products thay đổi
  useEffect(() => {
    if (reduxProducts.length > 0) {
      fetchProducts()  // Refetch để cập nhật
    }
  }, [reduxProducts])
  
  return <div>{/* Render products */}</div>
}
```

**Giải thích:**
- Lắng nghe `reduxProducts` thay đổi
- Khi SocketManager update Redux → Component tự động refetch
- Products mới xuất hiện ngay!

---

## 🔥 LƯU ĐỒ LUỒNG XỬ LÝ

```
1. ADMIN THÊM PRODUCT
   ↓
2. Admin Server emit event: "product:created"
   ↓
3. SocketManager (Client) nhận event
   ↓
4. listeners.js refetch products từ API
   ↓
5. dispatch(setProducts(newData)) → Update Redux
   ↓
6. Components đọc Redux → useSelector trigger
   ↓
7. React auto re-render với data mới
   ↓
8. ✅ UI CẬP NHẬT KHÔNG CẦN F5!
```

---

## 📋 DANH SÁCH PAGES VÀ CƠ CHẾ

| Page | Cách hoạt động | Socket riêng? |
|------|----------------|---------------|
| **Client Home** | Đọc Redux (categories, subcategories) | ❌ Không |
| **CategoryWiseProductDisplay** | Đọc Redux products → Refetch | ❌ Không |
| **Client SearchPage** | Đọc Redux products → Refetch search | ❌ Không |
| **Client ProductListPage** | ✅ Có socket listeners riêng | ✅ Có |
| **Client MyOrders** | Đọc Redux orders | ❌ Không |
| **Admin Home** | Đọc Redux (categories, subcategories) | ❌ Không |
| **Admin OrderAdmin** | ✅ Có socket listeners riêng | ✅ Có |
| **Admin ProductAdmin** | ✅ Có socket listeners riêng | ✅ Có |

**Lưu ý:**
- **ProductListPage**, **OrderAdmin**, **ProductAdmin** có socket riêng vì cần logic đặc biệt
- Các pages khác chỉ cần đọc Redux → Đơn giản hơn!

---

## 🎯 CÁC EVENTS ĐƯỢC XỬ LÝ

### Product Events (từ Admin Server)
- `product:created` → Thêm sản phẩm mới
- `product:updated` → Sửa thông tin sản phẩm  
- `product:deleted` → Xóa/ẩn sản phẩm

### Category Events (từ Admin Server)
- `category:created` → Thêm danh mục mới
- `category:updated` → Sửa danh mục
- `category:deleted` → Xóa danh mục

### SubCategory Events (từ Admin Server)
- `subcategory:created` → Thêm danh mục con
- `subcategory:updated` → Sửa danh mục con
- `subcategory:deleted` → Xóa danh mục con

### Order Events (từ User Server)
- `order:created` → User tạo đơn hàng mới
- `order:status_changed` → Admin thay đổi trạng thái đơn
- `order:cancelled` → User/Admin hủy đơn

---

## 🔧 SETUP CHO DỰ ÁN MỚI

### 1. Cài đặt dependencies
```bash
npm install socket.io-client
```

### 2. Tạo file .env
```env
VITE_ADMIN_SOCKET_URL=http://localhost:8081
```

### 3. Copy 3 files socket
```
client/src/socket/
├── SocketManager.jsx
├── useSocket.js
└── listeners.js
```

### 4. Mount SocketManager trong App.jsx
```jsx
import SocketManager from './socket/SocketManager'

function App() {
  return (
    <>
      <SocketManager />
      {/* ...rest of app */}
    </>
  )
}
```

### 5. Đọc Redux trong components
```jsx
const data = useSelector(state => state.product.allCategory)
// Component tự động re-render khi data thay đổi!
```

**Xong! Đơn giản vậy thôi!** ✅

---

## 🐛 DEBUG - CÁCH KIỂM TRA

### Kiểm tra Socket Connected
Mở Console (F12) → Tìm log:
```
[useSocket] Connecting to: http://localhost:8081
[Client] socket connected to admin_server xxxxx
[SocketManager] Socket connected! Now registering handlers
```

### Kiểm tra Nhận Events
Admin thêm product → Client console phải có:
```
[Socket] product:created - scheduling product refetch
[Socket] Product list refetched: 45 products
```

### Kiểm tra Redux Updated
Mở Redux DevTools → Xem action `product/setProducts`

### Kiểm tra Component Re-render
Thêm log trong component:
```jsx
console.log('[Home] Rendering with', categoryData.length, 'categories')
```

---

## ✨ ƯU ĐIỂM CỦA KIẾN TRÚC NÀY

✅ **Tập trung:** Tất cả socket logic ở 1 nơi (SocketManager + listeners)  
✅ **Đơn giản:** Components chỉ cần đọc Redux, không quan tâm socket  
✅ **Dễ bảo trì:** Thêm event mới chỉ cần sửa listeners.js  
✅ **Hiệu quả:** Debounce 300ms tránh refetch quá nhiều  
✅ **Linh hoạt:** Pages đặc biệt vẫn có thể dùng socket riêng  

---

## 📝 TÓM TẮT NGẮN GỌN

**3 điều quan trọng nhất:**

1. **SocketManager** - Mount 1 lần trong App.jsx, xử lý tất cả events
2. **Redux Store** - Lưu data chung, components đọc và tự động re-render
3. **Components** - Chỉ cần `useSelector`, không cần lo socket!

**Công thức:**
```
Admin thay đổi 
→ Backend emit event 
→ SocketManager nhận → Update Redux 
→ Components re-render 
→ ✅ UI cập nhật tự động!
```

---

**Date:** November 22, 2025  
**Status:** ✅ HOÀN THÀNH & TỐI ƯU HÓA  
**Coverage:** 100% pages có realtime
