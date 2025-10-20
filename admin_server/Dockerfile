# Dockerfile cho Backend (Node.js)
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Mở port 8080
EXPOSE 8080

# Chạy ứng dụng
CMD ["npm", "start"]