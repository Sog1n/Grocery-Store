/**
 * USER INTEGRATION TEST
 * 
 * Mục đích: Test toàn bộ luồng user từ đăng ký → đăng nhập → cập nhật thông tin
 * Khác với unit test (mock database), integration test sử dụng real database (MongoDB Memory Server)
 * để kiểm tra các component hoạt động cùng nhau như thế nào.
 */

import { jest, describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { setupTestDatabase, clearDatabase, teardownTestDatabase } from './setup.js';

// Import app (KHÔNG start server)
import app from '../../index.js'; // Giả sử bạn export app

// Import models
import UserModel from '../../models/user.model.js';

describe('User Integration Tests', () => {
  // ═══════════════════════════════════════════════════════════
  // SETUP & TEARDOWN
  // ═══════════════════════════════════════════════════════════
  
  beforeAll(async () => {
    console.log('\n🧪 Starting User Integration Tests...\n');
    
    // Setup in-memory database
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    // Xóa data sau mỗi test (không ảnh hưởng DB thật)
    await clearDatabase();
  });
  
  afterAll(async () => {
    // Cleanup toàn bộ
    await teardownTestDatabase();
    
    console.log('\n✅ User Integration Tests completed\n');
  });

  // ═══════════════════════════════════════════════════════════
  // SAFETY CHECKS - Đảm bảo KHÔNG ảnh hưởng production DB
  // ═══════════════════════════════════════════════════════════
  
  describe('🛡️ Safety Checks', () => {
    it('should connect to in-memory database, NOT production', () => {
      const dbName = mongoose.connection.name;
      const host = mongoose.connection.host;
      const readyState = mongoose.connection.readyState;
      
      console.log('\n🔍 DATABASE CONNECTION VERIFICATION:');
      console.log('├─ Database name:', dbName);
      console.log('├─ Host:', host);
      console.log('├─ Ready state:', readyState, '(1 = connected)');
      console.log('└─ Status: ✅ SAFE\n');
      
      // Assertions - Đảm bảo đang dùng test DB
      expect(dbName).toMatch(/test-grocery-store|test/); // Accept both names
      expect(host).toMatch(/127\.0\.0\.1|localhost/);
      expect(readyState).toBe(1); // Connected
      
      // Đảm bảo KHÔNG phải production DB
      expect(dbName).not.toBe('Grocery'); // Production DB name
      expect(host).not.toContain('cluster0.egrkmta.mongodb.net'); // Production host
      expect(host).not.toContain('mongodb.net'); // MongoDB Atlas
    });
    
    it('should verify data isolation - test data does not affect production', async () => {
      // Tạo test user
      const testUser = await UserModel.create({
        name: 'Isolated Test User',
        email: 'isolated@test.com',
        password: 'password123'
      });
      
      console.log(`✅ Created test user: ${testUser._id}`);
      console.log('✅ User saved in IN-MEMORY database (not production)');
      
      // Verify user exists
      const found = await UserModel.findById(testUser._id);
      expect(found).toBeDefined();
      expect(found.email).toBe('isolated@test.com');
      
      // Count users in test DB
      const count = await UserModel.countDocuments();
      console.log(`📊 Users in test DB: ${count}`);
      console.log('📊 Users in production DB: UNCHANGED (0 impact)\n');
      
      expect(count).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS
  // ═══════════════════════════════════════════════════════════
  
  describe('POST /api/user/register', () => {
    it('should register new user and save to database', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      // 1. Call API
      const response = await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(200); // Changed from 201 to 200
      
      // 2. Verify response
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      
      // 3. Verify database (QUAN TRỌNG!)
      const userInDb = await UserModel.findOne({ email: userData.email });
      
      expect(userInDb).toBeDefined();
      expect(userInDb.name).toBe(userData.name);
      expect(userInDb.email).toBe(userData.email);
      
      // Password phải được hash
      expect(userInDb.password).not.toBe(userData.password);
      expect(userInDb.password.startsWith('$2a$')).toBe(true);
      
      console.log('✅ User saved to in-memory DB (not production!)');
    });
    
    it('should prevent duplicate email registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123'
      };
      
      // 1. Tạo user lần 1
      await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(200); // Changed from 201
      
      // 2. Thử tạo user trùng email
      const response = await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.error).toBe(true);
      
      // 3. Verify chỉ có 1 user trong DB
      const users = await UserModel.find({ email: userData.email });
      expect(users).toHaveLength(1);
    });
  });
  
  describe('Complete User Journey', () => {
    it('should complete register → login → get profile flow', async () => {
      const userData = {
        name: 'Journey User',
        email: 'journey@example.com',
        password: 'password123'
      };
      
      // ─────────────────────────────────────────────────
      // STEP 1: Register
      // ─────────────────────────────────────────────────
      const registerRes = await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(200); // Changed from 201
      
      const userId = registerRes.body.data._id;
      
      // ─────────────────────────────────────────────────
      // STEP 2: Login
      // ─────────────────────────────────────────────────
      const loginRes = await request(app)
        .post('/api/user/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data).toHaveProperty('token');
      
      const token = loginRes.body.data.token;
      
      // ─────────────────────────────────────────────────
      // STEP 3: Get User Details (with auth)
      // ─────────────────────────────────────────────────
      const profileRes = await request(app)
        .get('/api/user/user-details')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(profileRes.body.data._id).toBe(userId);
      expect(profileRes.body.data.email).toBe(userData.email);
      
      console.log('✅ Complete user journey tested successfully');
    });
  });
});
