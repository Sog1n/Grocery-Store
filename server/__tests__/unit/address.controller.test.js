import { jest, describe, it, expect, beforeEach } from '@jest/globals'

/*
  Unit tests for controllers/address.controller.js
  - addAddressController
  - getAddressController
  - updateAddressController
  - deleteAddresscontroller
*/

// Create mocks
const mockAddressSave = jest.fn()
const mockAddressCtor = jest.fn().mockImplementation((payload) => {
  return { save: mockAddressSave }
})
// static methods on AddressModel
mockAddressCtor.find = jest.fn()
mockAddressCtor.updateOne = jest.fn()

const mockUserModel = {
  findByIdAndUpdate: jest.fn()
}

// Provide mocked modules before importing controller
await jest.unstable_mockModule('../../models/address.model.js', () => ({
  __esModule: true,
  default: mockAddressCtor
}))

await jest.unstable_mockModule('../../models/user.model.js', () => ({
  __esModule: true,
  default: mockUserModel
}))

// import controller under test
const {
  addAddressController,
  getAddressController,
  updateAddressController,
  deleteAddresscontroller
} = await import('../../controllers/address.controller.js')

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('address.controller', () => {
  describe('addAddressController', () => {
    it('creates address, pushes to user and returns created address', async () => {
      const saveAddress = { _id: 'addr1', address_line: '123', city: 'C' }
      mockAddressSave.mockResolvedValueOnce(saveAddress)
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce({})

      const req = {
        userId: 'u1',
        body: {
          address_line: '123',
          city: 'C',
          state: 'S',
          pincode: '10000',
          country: 'VN',
          mobile: '0123'
        }
      }
      const res = mockRes()

      await addAddressController(req, res)

      expect(mockAddressCtor).toHaveBeenCalledWith(
        expect.objectContaining({
          address_line: '123',
          city: 'C',
          state: 'S',
          pincode: '10000',
          country: 'VN',
          mobile: '0123',
          userId: 'u1'
        })
      )
      expect(mockAddressSave).toHaveBeenCalled()
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', {
        $push: { address_details: saveAddress._id }
      })
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        error: false,
        data: saveAddress
      }))
    })

    it('returns 500 when save throws', async () => {
      mockAddressSave.mockRejectedValueOnce(new Error('save fail'))
      const req = {
        userId: 'u1',
        body: { address_line: 'x' }
      }
      const res = mockRes()

      await addAddressController(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
    })
  })

  describe('getAddressController', () => {
    it('returns list of addresses for user', async () => {
      const addresses = [{ _id: 'a1' }]
      const sortMock = jest.fn().mockResolvedValueOnce(addresses)
      mockAddressCtor.find.mockReturnValueOnce({ sort: sortMock })

      const req = { userId: 'u1' }
      const res = mockRes()

      await getAddressController(req, res)

      expect(mockAddressCtor.find).toHaveBeenCalledWith({ userId: 'u1' })
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        error: false,
        data: addresses
      }))
    })

    it('returns 500 on error', async () => {
      mockAddressCtor.find.mockImplementationOnce(() => { throw new Error('fail') })
      const req = { userId: 'u1' }
      const res = mockRes()

      await getAddressController(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
    })
  })

  describe('updateAddressController', () => {
    it('updates address and returns update result', async () => {
      const updateResult = { matchedCount: 1 }
      mockAddressCtor.updateOne.mockResolvedValueOnce(updateResult)

      const req = {
        userId: 'u1',
        body: { _id: 'a1', address_line: 'new', city: 'C', state: 'S', country: 'VN', pincode: '10000', mobile: '09' }
      }
      const res = mockRes()

      await updateAddressController(req, res)

      expect(mockAddressCtor.updateOne).toHaveBeenCalledWith(
        { _id: 'a1', userId: 'u1' },
        expect.objectContaining({
          address_line: 'new',
          city: 'C',
          state: 'S',
          country: 'VN',
          mobile: '09',
          pincode: '10000'
        })
      )
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        error: false,
        data: updateResult
      }))
    })

    it('returns 500 on update error', async () => {
      mockAddressCtor.updateOne.mockRejectedValueOnce(new Error('uerr'))
      const req = { userId: 'u1', body: { _id: 'a1' } }
      const res = mockRes()

      await updateAddressController(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
    })
  })

  describe('deleteAddresscontroller', () => {
    it('marks address status false and returns result', async () => {
      const result = { acknowledged: true }
      mockAddressCtor.updateOne.mockResolvedValueOnce(result)

      const req = { userId: 'u1', body: { _id: 'a1' } }
      const res = mockRes()

      await deleteAddresscontroller(req, res)

      expect(mockAddressCtor.updateOne).toHaveBeenCalledWith(
        { _id: 'a1', userId: 'u1' },
        { status: false }
      )
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        error: false,
        data: result
      }))
    })

    it('returns 500 on delete error', async () => {
      mockAddressCtor.updateOne.mockRejectedValueOnce(new Error('derr'))
      const req = { userId: 'u1', body: { _id: 'a1' } }
      const res = mockRes()

      await deleteAddresscontroller(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
    })
  })
})
