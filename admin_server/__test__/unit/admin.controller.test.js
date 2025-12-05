import { jest } from '@jest/globals'

describe('Admin Login Controller - Unit Tests', () => {
  let AdminloginController
  let AdminlogoutController
  let UserModel
  let bcryptjs
  let generatedAccessToken
  let genertedRefreshToken
  
  let mockRequest
  let mockResponse

  beforeAll(async () => {
    // Import modules
    const userModelModule = await import('../../models/user.model.js')
    UserModel = userModelModule.default
    
    const bcryptjsModule = await import('bcryptjs')
    bcryptjs = bcryptjsModule.default
    
    const accessTokenModule = await import('../../utils/generatedAccessToken.js')
    generatedAccessToken = accessTokenModule.default
    
    const refreshTokenModule = await import('../../utils/generatedRefreshToken.js')
    genertedRefreshToken = refreshTokenModule.default
    
    // Spy on methods để mock
    jest.spyOn(UserModel, 'findOne')
    jest.spyOn(UserModel, 'findByIdAndUpdate')
    jest.spyOn(bcryptjs, 'compare')
    
    // Import controllers
    const controllerModule = await import('../../controllers/admin.controller.js')
    AdminloginController = controllerModule.AdminloginController
    AdminlogoutController = controllerModule.AdminlogoutController
  })

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    mockRequest = {
      body: {},
      userId: null
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    }
  })

  describe('AdminloginController', () => {
    test('TC001: Thiếu email - trả về lỗi 400', async () => {
      mockRequest.body = { password: 'password123' }

      await AdminloginController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'provide email, password',
        error: true,
        success: false
      })
    })

    test('TC002: Thiếu password - trả về lỗi 400', async () => {
      mockRequest.body = { email: 'admin@gmail.com' }

      await AdminloginController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'provide email, password',
        error: true,
        success: false
      })
    })

    test('TC003: Thiếu cả email và password - trả về lỗi 400', async () => {
      mockRequest.body = {}

      await AdminloginController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'provide email, password',
        error: true,
        success: false
      })
    })

    test('TC004: Email không tồn tại - trả về lỗi 400', async () => {
      mockRequest.body = {
        email: 'notexist@gmail.com',
        password: 'password123'
      }

      UserModel.findOne.mockResolvedValue(null)

      await AdminloginController(mockRequest, mockResponse)

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'notexist@gmail.com' })
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Admin not found',
        error: true,
        success: false
      })
    })

    test('TC005: User không phải ADMIN - trả về lỗi 400', async () => {
      mockRequest.body = {
        email: 'user@gmail.com',
        password: 'password123'
      }

      const mockUser = {
        _id: 'user-id-123',
        email: 'user@gmail.com',
        password: 'hashedpassword',
        role: 'USER'
      }

      UserModel.findOne.mockResolvedValue(mockUser)

      await AdminloginController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'You do not have admin rights',
        error: true,
        success: false
      })
    })

    test('TC006: Mật khẩu sai - trả về lỗi 400', async () => {
      mockRequest.body = {
        email: 'admin@gmail.com',
        password: 'wrongpassword'
      }

      const mockAdmin = {
        _id: 'admin-id-123',
        email: 'admin@gmail.com',
        password: '$2a$10$hashedpassword',
        role: 'ADMIN'
      }

      UserModel.findOne.mockResolvedValue(mockAdmin)
      bcryptjs.compare.mockResolvedValue(false)

      await AdminloginController(mockRequest, mockResponse)

      expect(bcryptjs.compare).toHaveBeenCalledWith('wrongpassword', '$2a$10$hashedpassword')
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Check your password',
        error: true,
        success: false
      })
    })

    test('TC007: Password rỗng - trả về lỗi 400', async () => {
      mockRequest.body = {
        email: 'admin@gmail.com',
        password: ''
      }

      await AdminloginController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'provide email, password',
        error: true,
        success: false
      })
    })

    test('TC008: Email rỗng - trả về lỗi 400', async () => {
      mockRequest.body = {
        email: '',
        password: 'password123'
      }

      await AdminloginController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'provide email, password',
        error: true,
        success: false
      })
    })
  })

  describe('AdminlogoutController', () => {
    test('TC009: Logout thành công', async () => {
      const mockUserId = 'admin-id-789'
      mockRequest.userId = mockUserId

      UserModel.findByIdAndUpdate.mockResolvedValue({
        _id: mockUserId,
        email: 'admin@gmail.com',
        refresh_token: ''
      })

      await AdminlogoutController(mockRequest, mockResponse)

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        { refresh_token: '' }
      )

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2)

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'admin_accessToken',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        })
      )

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'admin_refreshToken',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        })
      )

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logout successfully',
        error: false,
        success: true
      })
    })

    test('TC010: Lỗi database - trả về lỗi 500', async () => {
      mockRequest.userId = 'admin-id-xyz'
      
      const dbError = new Error('Database update failed')
      UserModel.findByIdAndUpdate.mockRejectedValue(dbError)

      await AdminlogoutController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Database update failed',
        error: true,
        success: false
      })
    })
  })
})
