import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockUserModel = {
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}
const mockBcrypt = { compare: jest.fn() }
const mockGenAT = jest.fn(async () => 'mock-access-token')
const mockGenRT = jest.fn(async () => 'mock-refresh-token')

await jest.unstable_mockModule('../models/user.model.js', () => ({
  __esModule: true,
  default: mockUserModel,
}))

await jest.unstable_mockModule('bcryptjs', () => ({
  __esModule: true,
  default: mockBcrypt,
}))

await jest.unstable_mockModule('../utils/generatedAccessToken.js', () => ({
  __esModule: true,
  default: mockGenAT,
}))

await jest.unstable_mockModule('../utils/generatedRefreshToken.js', () => ({
  __esModule: true,
  default: mockGenRT,
}))

const { loginController, logoutController } = await import('../controllers/user.controller.js')
const UserModel = (await import('../models/user.model.js')).default
const bcryptjs = (await import('bcryptjs')).default
const generatedAccessToken = (await import('../utils/generatedAccessToken.js')).default
const genertedRefreshToken = (await import('../utils/generatedRefreshToken.js')).default

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

