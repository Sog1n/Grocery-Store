# Dockerfile cho Frontend (React)
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Mở port 5174 (Vite default port)
EXPOSE 5174

# Chạy ứng dụng ở chế độ development với host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]