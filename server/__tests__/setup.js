// Biến môi trường dùng trong test
process.env.SECRET_KEY_ACCESS_TOKEN = 'test-access';
process.env.SECRET_KEY_REFRESH_TOKEN = 'test-refresh';

// Tăng timeout chung
jest.setTimeout(15000);