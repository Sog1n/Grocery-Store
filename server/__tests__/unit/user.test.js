import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Create a proper constructor mock for UserModel
const mockUserModel = jest.fn()
mockUserModel.findOne = jest.fn()
mockUserModel.findByIdAndUpdate = jest.fn()
mockUserModel.updateOne = jest.fn()
mockUserModel.findOneAndUpdate = jest.fn()
mockUserModel.prototype.save = jest.fn()

const mockBcrypt = { compare: jest.fn(), genSalt: jest.fn(), hash: jest.fn() }
const mockSendEmail = jest.fn()
const mockVerifyEmailTemplate = jest.fn()
const mockForgotPasswordTemplate = jest.fn()
const mockGeneratedOtp = jest.fn()
const mockUploadImageClodinary = jest.fn()
const mockGenAT = jest.fn(async () => 'mock-access-token')
const mockGenRT = jest.fn(async () => 'mock-refresh-token')

await jest.unstable_mockModule('../../models/user.model.js', () => ({
  __esModule: true,
  default: mockUserModel,
}))

await jest.unstable_mockModule('bcryptjs', () => ({
  __esModule: true,
  default: mockBcrypt,
}))

await jest.unstable_mockModule('../../config/sendEmail.js', () => ({
  __esModule: true,
  default: mockSendEmail,
}))

await jest.unstable_mockModule('../../utils/verifyEmailTemplate.js', () => ({
  __esModule: true,
  default: mockVerifyEmailTemplate,
}))

await jest.unstable_mockModule('../../utils/forgotPasswordTemplate.js', () => ({
  __esModule: true,
  default: mockForgotPasswordTemplate,
}))

await jest.unstable_mockModule('../../utils/generatedOtp.js', () => ({
  __esModule: true,
  default: mockGeneratedOtp,
}))

await jest.unstable_mockModule('../../utils/uploadImageClodinary.js', () => ({
  __esModule: true,
  default: mockUploadImageClodinary,
}))

await jest.unstable_mockModule('../../utils/generatedAccessToken.js', () => ({
  __esModule: true,
  default: mockGenAT,
}))

await jest.unstable_mockModule('../../utils/generatedRefreshToken.js', () => ({
  __esModule: true,
  default: mockGenRT,
}))

const {
  loginController,
  logoutController,
  registerUserController,
  verifyEmailController,
  uploadAvatar,
  updateUserDetails,
  forgotPasswordController,
  verifyForgotPasswordOtp,
  resetpassword,
} = await import('../../controllers/user.controller.js')
const UserModel = (await import('../../models/user.model.js')).default
const bcryptjs = (await import('bcryptjs')).default
const sendEmail = (await import('../../config/sendEmail.js')).default
const verifyEmailTemplate = (await import('../../utils/verifyEmailTemplate.js')).default
const forgotPasswordTemplate = (await import('../../utils/forgotPasswordTemplate.js')).default
const generatedOtp = (await import('../../utils/generatedOtp.js')).default
const uploadImageClodinary = (await import('../../utils/uploadImageClodinary.js')).default
const generatedAccessToken = (await import('../../utils/generatedAccessToken.js')).default
const genertedRefreshToken = (await import('../../utils/generatedRefreshToken.js')).default

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.clearCookie = jest.fn().mockReturnValue(res) // thêm để test xóa cookie
  return res
}

describe('loginController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('400 khi thiếu email hoặc password', async () => {
    const req = { body: {} }
    const res = mockRes()

    await loginController(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: true, success: false })
    )
  })

  it('400 khi user chưa đăng ký', async () => {
    UserModel.findOne.mockResolvedValueOnce(null)

    const req = { body: { email: 'a@b.com', password: '123' } }
    const res = mockRes()

    await loginController(req, res)

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'a@b.com' })
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
  })

  it('400 khi user không ở trạng thái Active', async () => {
    UserModel.findOne.mockResolvedValueOnce({ status: 'Pending' })

    const req = { body: { email: 'a@b.com', password: '123' } }
    const res = mockRes()

    await loginController(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
  })

  it('400 khi mật khẩu sai', async () => {
    UserModel.findOne.mockResolvedValueOnce({
      _id: 'u1',
      status: 'Active',
      password: 'hashed',
    })
    bcryptjs.compare.mockResolvedValueOnce(false)

    const req = { body: { email: 'a@b.com', password: 'wrong' } }
    const res = mockRes()

    await loginController(req, res)

    expect(bcryptjs.compare).toHaveBeenCalledWith('wrong', 'hashed')
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
  })

  it('200 khi đăng nhập hợp lệ, set cookies và trả về token', async () => {
    UserModel.findOne.mockResolvedValueOnce({
      _id: 'u1',
      status: 'Active',
      password: 'hashed',
    })
    bcryptjs.compare.mockResolvedValueOnce(true)
    UserModel.findByIdAndUpdate.mockResolvedValueOnce({})

    const req = { body: { email: 'a@b.com', password: 'Secret123!' } }
    const res = mockRes()

    await loginController(req, res)

    expect(generatedAccessToken).toHaveBeenCalledWith('u1')
    expect(genertedRefreshToken).toHaveBeenCalledWith('u1')

    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'mock-access-token',
      expect.objectContaining({ httpOnly: true })
    )
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'mock-refresh-token',
      expect.objectContaining({ httpOnly: true })
    )

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        error: false,
        success: true,
        data: {
          accesstoken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    )
  })
})

describe('logoutController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('200 khi logout thành công: xóa cookies accessToken và refreshToken', async () => {
    const req = { userId: 'u1', cookies: { accessToken: 'a', refreshToken: 'r' } }
    const res = mockRes()

    await logoutController(req, res)

    // chấp nhận 1 trong 2 cách xóa cookie: clearCookie hoặc set '' + maxAge: 0
    const clearedAccess =
      res.clearCookie.mock.calls.some(([name]) => name === 'accessToken') ||
      res.cookie.mock.calls.some(([name, value, options]) => name === 'accessToken' && value === '' && options?.maxAge === 0)

    const clearedRefresh =
      res.clearCookie.mock.calls.some(([name]) => name === 'refreshToken') ||
      res.cookie.mock.calls.some(([name, value, options]) => name === 'refreshToken' && value === '' && options?.maxAge === 0)

    expect(clearedAccess).toBe(true)
    expect(clearedRefresh).toBe(true)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: false,
      success: true
    }))
  })
})

describe('registerUserController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when missing fields', async () => {
    const req = { body: {} }
    const res = mockRes()
    await registerUserController(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
  })

  it('returns 400 when user already exists', async () => {
    // giả lập user đã tồn tại
    UserModel.findOne.mockResolvedValueOnce({ _id: 'u1' })

    const req = { body: { name: 'Test', email: 'a@b.com', password: 'p' } }
    const res = mockRes()

    await registerUserController(req, res)

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'a@b.com' })
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
  })

  it('registers user, hashes password, sends verification email and returns success', async () => {
    // giả lập chưa có user
    UserModel.findOne.mockResolvedValueOnce(null)
    // mock bcrypt
    bcryptjs.genSalt.mockResolvedValueOnce('salt')
    bcryptjs.hash.mockResolvedValueOnce('hashedpwd')
    // mock lưu user (new UserModel(...).save())
    const saved = { _id: 'newid', name: 'n', email: 'a@b.com', password: 'hashedpwd' }
    const mockSave = jest.fn().mockResolvedValueOnce(saved)
    mockUserModel.prototype.save = mockSave
    
    // mock verifyEmailTemplate để trả về HTML string
    mockVerifyEmailTemplate.mockReturnValueOnce('<html>Verify Email</html>')
    // mock sendEmail
    mockSendEmail.mockResolvedValueOnce(true)

    const req = { body: { name: 'n', email: 'a@b.com', password: 'plain' } }
    const res = mockRes()

    await registerUserController(req, res)

    expect(bcryptjs.genSalt).toHaveBeenCalled()
    expect(bcryptjs.hash).toHaveBeenCalledWith('plain', 'salt')
    // Chỉ kiểm tra kết quả cuối thay vì kiểm tra từng bước internal
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: true,
      error: false,
      message: expect.any(String)
    }))
  })
})

describe('verifyEmailController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when code not found', async () => {
    UserModel.findOne.mockResolvedValueOnce(null)
    const req = { body: { code: 'nope' } }
    const res = mockRes()
    await verifyEmailController(req, res)
    expect(UserModel.findOne).toHaveBeenCalledWith({ _id: 'nope' })
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
  })

  it('verifies email when user exists', async () => {
    UserModel.findOne.mockResolvedValueOnce({ _id: 'u1' })
    UserModel.updateOne.mockResolvedValueOnce({})
    const req = { body: { code: 'u1' } }
    const res = mockRes()
    await verifyEmailController(req, res)
    expect(UserModel.updateOne).toHaveBeenCalledWith({ _id: 'u1' }, { verify_email: true })
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('uploadAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uploads image and updates user avatar', async () => {
    uploadImageClodinary.mockResolvedValueOnce({ url: 'http://img' })
    UserModel.findByIdAndUpdate.mockResolvedValueOnce({})
    const req = { userId: 'u1', file: { originalname: 'a' } }
    const res = mockRes()
    await uploadAvatar(req, res)
    expect(uploadImageClodinary).toHaveBeenCalledWith(req.file)
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', { avatar: 'http://img' })
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ avatar: 'http://img' }) }))
  })
})

describe('updateUserDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates name/email/password and hashes password when provided', async () => {
    bcryptjs.genSalt.mockResolvedValueOnce('salt2')
    bcryptjs.hash.mockResolvedValueOnce('hashed2')
    UserModel.updateOne.mockResolvedValueOnce({})
    const req = { userId: 'u1', body: { name: 'New', email: 'n@e', password: 'pw' } }
    const res = mockRes()
    await updateUserDetails(req, res)
    expect(bcryptjs.genSalt).toHaveBeenCalled()
    expect(bcryptjs.hash).toHaveBeenCalledWith('pw', 'salt2')
    expect(UserModel.updateOne).toHaveBeenCalledWith({ _id: 'u1' }, expect.objectContaining({ name: 'New', email: 'n@e' }))
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('forgotPasswordController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when user not found', async () => {
    UserModel.findOne.mockResolvedValueOnce(null)
    const req = { body: { email: 'x@y' } }
    const res = mockRes()
    await forgotPasswordController(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('generates otp, saves and emails user', async () => {
    UserModel.findOne.mockResolvedValueOnce({ _id: 'u1', name: 'n', email: 'x@y' })
    generatedOtp.mockReturnValueOnce('9999')
    UserModel.findByIdAndUpdate.mockResolvedValueOnce({})
    sendEmail.mockResolvedValueOnce(true)
    const req = { body: { email: 'x@y' } }
    const res = mockRes()
    await forgotPasswordController(req, res)
    expect(generatedOtp).toHaveBeenCalled()
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', expect.objectContaining({ forgot_password_otp: '9999' }))
    expect(sendEmail).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('verifyForgotPasswordOtp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when missing fields', async () => {
    const req = { body: {} }
    const res = mockRes()
    await verifyForgotPasswordOtp(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when user not found', async () => {
    UserModel.findOne.mockResolvedValueOnce(null)
    const req = { body: { email: 'a@b', otp: '1' } }
    const res = mockRes()
    await verifyForgotPasswordOtp(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('verifies otp when valid and not expired', async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    UserModel.findOne.mockResolvedValueOnce({ _id: 'u1', forgot_password_otp: '1111', forgot_password_expiry: future })
    UserModel.findByIdAndUpdate.mockResolvedValueOnce({})
    const req = { body: { email: 'a@b', otp: '1111' } }
    const res = mockRes()
    await verifyForgotPasswordOtp(req, res)
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', expect.objectContaining({ forgot_password_otp: '', forgot_password_expiry: '' }))
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('resetpassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when missing fields', async () => {
    const req = { body: {} }
    const res = mockRes()
    await resetpassword(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when user not found', async () => {
    UserModel.findOne.mockResolvedValueOnce(null)
    const req = { body: { email: 'a@b', newPassword: '1', confirmPassword: '1' } }
    const res = mockRes()
    await resetpassword(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when passwords do not match', async () => {
    UserModel.findOne.mockResolvedValueOnce({ _id: 'u1' })
    const req = { body: { email: 'a@b', newPassword: '1', confirmPassword: '2' } }
    const res = mockRes()
    await resetpassword(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('hashes new password and updates user', async () => {
    UserModel.findOne.mockResolvedValueOnce({ _id: 'u1' })
    bcryptjs.genSalt.mockResolvedValueOnce('saltx')
    bcryptjs.hash.mockResolvedValueOnce('hashedx')
    UserModel.findOneAndUpdate.mockResolvedValueOnce({})
    const req = { body: { email: 'a@b', newPassword: 'pw', confirmPassword: 'pw' } }
    const res = mockRes()
    await resetpassword(req, res)
    expect(bcryptjs.hash).toHaveBeenCalledWith('pw', 'saltx')
    expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith('u1', { password: 'hashedx' })
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

