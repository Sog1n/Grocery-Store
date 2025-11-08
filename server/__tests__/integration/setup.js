import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

/**
 * 🔧 SETUP: Chạy TRƯỚC TẤT CẢ tests
 * - Tạo MongoDB instance trong RAM
 * - Connect mongoose vào in-memory DB
 */
export async function setupTestDatabase() {
  try {
    // ═══════════════════════════════════════════════════════════
    // BƯỚC 1: DISCONNECT TỪ PRODUCTION DB (NẾU CÓ)
    // ═══════════════════════════════════════════════════════════
    if (mongoose.connection.readyState !== 0) {
      console.log('⚠️  Detected existing connection, disconnecting...');
      await mongoose.disconnect();
      console.log('✅ Disconnected from production DB');
    }

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 2: TẠO MONGODB MEMORY SERVER
    // ═══════════════════════════════════════════════════════════
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 0, // Random port
        dbName: 'test-grocery-store', // Tên DB test
      },
    });

    const uri = mongoServer.getUri();
    
    console.log('\n┌─────────────────────────────────────────────────┐');
    console.log('│  🚀 MongoDB Memory Server STARTED               │');
    console.log('├─────────────────────────────────────────────────┤');
    console.log(`│  📍 URI: ${uri}`);
    console.log(`│  💾 Database: test-grocery-store (IN MEMORY)    │`);
    console.log('│  ✅ SAFE: No impact on production DB            │');
    console.log('└─────────────────────────────────────────────────┘\n');
    
    // ═══════════════════════════════════════════════════════════
    // BƯỚC 3: CONNECT MONGOOSE TO MEMORY SERVER
    // ═══════════════════════════════════════════════════════════
    await mongoose.connect(uri);
    
    console.log('✅ Mongoose connected to IN-MEMORY database');
    console.log(`✅ Connection state: ${mongoose.connection.readyState} (1 = connected)`);
    console.log(`✅ Database name: ${mongoose.connection.name}\n`);
    
    // Verify connection
    if (mongoose.connection.db) {
      const admin = mongoose.connection.db.admin();
      const info = await admin.serverInfo();
      console.log(`📊 MongoDB version: ${info.version}`);
      console.log(`📊 Memory-only: ${uri.includes('127.0.0.1') || uri.includes('localhost')}\n`);
    }
    
    return { uri, mongoServer };
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

/**
 * 🧹 CLEANUP: Xóa tất cả data sau mỗi test
 */
export async function clearDatabase() {
  if (!mongoose.connection.db) {
    console.warn('⚠️ No database connection to clear');
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // SAFETY CHECK: Đảm bảo KHÔNG xóa production database!
  // ═══════════════════════════════════════════════════════════
  const dbName = mongoose.connection.name;
  const host = mongoose.connection.host;
  
  // Kiểm tra xem có phải test database không
  if (dbName !== 'test-grocery-store' && dbName !== 'test') {
    throw new Error(
      `🚨 SAFETY CHECK FAILED! 
      Attempting to clear NON-TEST database!
      Database: ${dbName}
      Host: ${host}
      
      This could DELETE PRODUCTION DATA!
      Test execution STOPPED to protect your data.`
    );
  }
  
  // Kiểm tra host phải là localhost/127.0.0.1
  if (!host.includes('127.0.0.1') && !host.includes('localhost')) {
    throw new Error(
      `🚨 SAFETY CHECK FAILED!
      Database host is NOT localhost/127.0.0.1
      Host: ${host}
      
      This could be a PRODUCTION database!
      Test execution STOPPED to protect your data.`
    );
  }

  // Safe to clear
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    const count = await collection.countDocuments();
    await collection.deleteMany({});
    console.log(`🧹 Cleared collection: ${key} (${count} documents deleted)`);
  }
  
  console.log('✅ Test database cleared safely\n');
}

/**
 * 🔌 TEARDOWN: Chạy SAU TẤT CẢ tests
 * - Disconnect mongoose
 * - Stop MongoDB Memory Server
 * - Giải phóng RAM
 */
export async function teardownTestDatabase() {
  try {
    // Đóng tất cả connections
    await mongoose.disconnect();
    console.log('🔌 Mongoose disconnected');
    
    // Stop memory server
    if (mongoServer) {
      await mongoServer.stop();
      console.log('🛑 MongoDB Memory Server stopped');
    }
  } catch (error) {
    console.error('❌ Failed to teardown test database:', error);
    throw error;
  }
}

/**
 * 📊 Lấy thông tin database (debug)
 */
export function getDatabaseInfo() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  };
}
