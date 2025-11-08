import { jest } from '@jest/globals'

// Biến môi trường dùng trong unit test
process.env.SECRET_KEY_ACCESS_TOKEN = 'test-access';
process.env.SECRET_KEY_REFRESH_TOKEN = 'test-refresh';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Tăng timeout chung cho unit tests
jest.setTimeout(15000);
