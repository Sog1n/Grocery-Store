import { jest, describe, it, expect, beforeEach } from '@jest/globals'

/*
 Unit tests for controllers/cart.controller.js
 Covers:
 - addToCartItemController
 - getCartItemController
 - updateCartItemQtyController
 - deleteCartItemQtyController
 - validateCartForCheckout
*/

// Mocks for models
const mockCartSave = jest.fn()
const MockCartCtor = jest.fn().mockImplementation((payload) => ({ save: mockCartSave, toObject: () => payload }))
MockCartCtor.findOne = jest.fn()
MockCartCtor.find = jest.fn()
MockCartCtor.updateOne = jest.fn()
MockCartCtor.deleteOne = jest.fn()
MockCartCtor.findOneAndPopulate = undefined

const mockProductModel = {
  findById: jest.fn()
}

const mockUserModel = {
  updateOne: jest.fn()
}

// Provide mocks before importing controller
await jest.unstable_mockModule('../../models/cartproduct.model.js', () => ({
  __esModule: true,
  default: MockCartCtor
}))
await jest.unstable_mockModule('../../models/product.model.js', () => ({
  __esModule: true,
  default: mockProductModel
}))
await jest.unstable_mockModule('../../models/user.model.js', () => ({
  __esModule: true,
  default: mockUserModel
}))

const {
  addToCartItemController,
  getCartItemController,
  updateCartItemQtyController,
  deleteCartItemQtyController,
  validateCartForCheckout
} = await import('../../controllers/cart.controller.js')

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('cart.controller', () => {
  describe('addToCartItemController', () => {
    it('returns 402 when productId missing', async () => {
      const req = { userId: 'u1', body: {} }
      const res = mockRes()
      await addToCartItemController(req, res)
      expect(res.status).toHaveBeenCalledWith(402)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
    })

    it('returns 404 when product not found', async () => {
      mockProductModel.findById.mockResolvedValueOnce(null)
      const req = { userId: 'u1', body: { productId: 'p1' } }
      const res = mockRes()
      await addToCartItemController(req, res)
      expect(mockProductModel.findById).toHaveBeenCalledWith('p1')
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('returns 400 when product not published', async () => {
      mockProductModel.findById.mockResolvedValueOnce({ publish: false, stock: 10 })
      const req = { userId: 'u1', body: { productId: 'p1' } }
      const res = mockRes()
      await addToCartItemController(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 when out of stock', async () => {
      mockProductModel.findById.mockResolvedValueOnce({ publish: true, stock: 0 })
      const req = { userId: 'u1', body: { productId: 'p1' } }
      const res = mockRes()
      await addToCartItemController(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 when item already in cart', async () => {
      MockCartCtor.findOne.mockResolvedValueOnce({ _id: 'c1' })
      mockProductModel.findById.mockResolvedValueOnce({ publish: true, stock: 5 })
      const req = { userId: 'u1', body: { productId: 'p1' } }
      const res = mockRes()
      await addToCartItemController(req, res)
      expect(MockCartCtor.findOne).toHaveBeenCalledWith({ userId: 'u1', productId: 'p1' })
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('adds item to cart and updates user', async () => {
      MockCartCtor.findOne.mockResolvedValueOnce(null)
      mockProductModel.findById.mockResolvedValueOnce({ publish: true, stock: 5 })
      const saved = { _id: 'c123', quantity: 1, userId: 'u1', productId: 'p1' }
      mockCartSave.mockResolvedValueOnce(saved)
      mockUserModel.updateOne.mockResolvedValueOnce({})

      const req = { userId: 'u1', body: { productId: 'p1' } }
      const res = mockRes()

      await addToCartItemController(req, res)

      expect(MockCartCtor).toHaveBeenCalledWith(expect.objectContaining({
        quantity: 1, userId: 'u1', productId: 'p1'
      }))
      expect(mockCartSave).toHaveBeenCalled()
      expect(mockUserModel.updateOne).toHaveBeenCalledWith({ _id: 'u1' }, { $push: { shopping_cart: 'p1' } })
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: saved }))
    })

    it('returns 500 on unexpected error', async () => {
      // mock as an explicit rejected Promise implementation
      mockProductModel.findById.mockImplementationOnce(() => Promise.reject(new Error('boom')))
      const req = { userId: 'u1', body: { productId: 'p1' } }
      const res = mockRes()
      // controller handles error and returns response
      await addToCartItemController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
    })
  })

  describe('getCartItemController', () => {
    it('returns items with status flags and summary', async () => {
      const item1 = { _id: 'i1', toObject: () => ({ _id: 'i1', productId: { _id: 'p1', publish: true, stock: 2, name: 'A' }, quantity: 1 }) }
      const item2 = { _id: 'i2', toObject: () => ({ _id: 'i2', productId: null, quantity: 1 }) }
      const populateResult = [item1, item2]
      const populateMock = jest.fn().mockResolvedValueOnce(populateResult)
      MockCartCtor.find.mockReturnValueOnce({
        populate: populateMock
      })

      const req = { userId: 'u1' }
      const res = mockRes()

      await getCartItemController(req, res)

      expect(MockCartCtor.find).toHaveBeenCalledWith({ userId: 'u1' })
      expect(populateMock).toHaveBeenCalledWith('productId')
      // item1 has productId but controller marks it discontinued/outOfStock based on logic
      // item2 has null productId so is discontinued & outOfStock
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        error: false,
        summary: expect.objectContaining({ 
          totalItems: 2, 
          discontinuedItems: expect.any(Number),
          outOfStockItems: expect.any(Number)
        })
      }))
    })

    it('returns 500 on error', async () => {
      // mock find to return query with populate that rejects
      MockCartCtor.find.mockReturnValueOnce({
        populate: () => Promise.reject(new Error('fail'))
      })
      const req = { userId: 'u1' }
      const res = mockRes()
      await getCartItemController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('updateCartItemQtyController', () => {
    it('returns 400 when missing _id or qty', async () => {
      const req = { userId: 'u1', body: { _id: null } }
      const res = mockRes()
      await updateCartItemQtyController(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 404 when cart item not found', async () => {
      MockCartCtor.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(null)
      })
      const req = { userId: 'u1', body: { _id: 'c1', qty: 2 } }
      const res = mockRes()
      await updateCartItemQtyController(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('returns 400 when product missing or unpublished or insufficient stock', async () => {
      // product missing
      MockCartCtor.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce({ productId: null })
      })
      const req1 = { userId: 'u1', body: { _id: 'c1', qty: 2 } }
      const res1 = mockRes()
      await updateCartItemQtyController(req1, res1)
      expect(res1.status).toHaveBeenCalledWith(400)

      // unpublished
      MockCartCtor.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce({ productId: { publish: false, stock: 10 } })
      })
      const res2 = mockRes()
      await updateCartItemQtyController({ userId: 'u1', body: { _id: 'c1', qty: 2 } }, res2)
      expect(res2.status).toHaveBeenCalledWith(400)

      // insufficient stock
      MockCartCtor.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce({ productId: { publish: true, stock: 1 } })
      })
      const res3 = mockRes()
      await updateCartItemQtyController({ userId: 'u1', body: { _id: 'c1', qty: 2 } }, res3)
      expect(res3.status).toHaveBeenCalledWith(400)
    })

    it('updates quantity successfully', async () => {
      MockCartCtor.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce({ productId: { publish: true, stock: 5 } })
      })
      MockCartCtor.updateOne.mockResolvedValueOnce({ matchedCount: 1 })
      const req = { userId: 'u1', body: { _id: 'c1', qty: 3 } }
      const res = mockRes()
      await updateCartItemQtyController(req, res)
      expect(MockCartCtor.updateOne).toHaveBeenCalledWith({ _id: 'c1', userId: 'u1' }, { quantity: 3 })
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('returns 500 on unexpected error', async () => {
      // mock findOne to return query object with populate that rejects
      MockCartCtor.findOne.mockReturnValueOnce({
        populate: () => Promise.reject(new Error('boom'))
      })
      const req = { userId: 'u1', body: { _id: 'c1', qty: 1 } }
      const res = mockRes()
      await updateCartItemQtyController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('deleteCartItemQtyController', () => {
    it('returns 400 when _id missing', async () => {
      const req = { userId: 'u1', body: {} }
      const res = mockRes()
      await deleteCartItemQtyController(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('deletes item successfully', async () => {
      MockCartCtor.deleteOne.mockResolvedValueOnce({ deletedCount: 1 })
      const req = { userId: 'u1', body: { _id: 'c1' } }
      const res = mockRes()
      await deleteCartItemQtyController(req, res)
      expect(MockCartCtor.deleteOne).toHaveBeenCalledWith({ _id: 'c1', userId: 'u1' })
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('returns 500 on delete error', async () => {
      MockCartCtor.deleteOne.mockImplementationOnce(() => Promise.reject(new Error('err')))
      const req = { userId: 'u1', body: { _id: 'c1' } }
      const res = mockRes()
      await deleteCartItemQtyController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('validateCartForCheckout', () => {
    it('returns issues for not found / discontinued / out_of_stock / insufficient_stock', async () => {
      const cartItems = [
        { _id: 'i1', productId: null, quantity: 1 },
        { _id: 'i2', productId: { _id: 'p2', name: 'P2', publish: false, stock: 10 }, quantity: 1 },
        { _id: 'i3', productId: { _id: 'p3', name: 'P3', publish: true, stock: 0 }, quantity: 1 },
        { _id: 'i4', productId: { _id: 'p4', name: 'P4', publish: true, stock: 1 }, quantity: 2 }
      ]
      const populateMock = jest.fn().mockResolvedValueOnce(cartItems)
      MockCartCtor.find.mockReturnValueOnce({
        populate: populateMock
      })

      const req = { userId: 'u1' }
      const res = mockRes()

      await validateCartForCheckout(req, res)

      expect(populateMock).toHaveBeenCalledWith('productId')
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        canCheckout: false,
        issues: expect.arrayContaining([
          expect.objectContaining({ type: 'not_found' }),
          expect.objectContaining({ type: 'discontinued' }),
          expect.objectContaining({ type: 'out_of_stock' }),
          expect.objectContaining({ type: 'insufficient_stock' })
        ])
      }))
    })

    it('returns canCheckout true when no issues', async () => {
      const cartItems = [
        { _id: 'i1', productId: { _id: 'p1', name: 'P1', publish: true, stock: 5 }, quantity: 1 }
      ]
      const populateMock = jest.fn().mockResolvedValueOnce(cartItems)
      MockCartCtor.find.mockReturnValueOnce({
        populate: populateMock
      })

      const req = { userId: 'u1' }
      const res = mockRes()
      await validateCartForCheckout(req, res)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        canCheckout: true,
        issues: [],
        success: true
      }))
    })

    it('returns 500 on unexpected error', async () => {
      // mock find to return query with populate that rejects
      MockCartCtor.find.mockReturnValueOnce({
        populate: () => Promise.reject(new Error('boom'))
      })
      const req = { userId: 'u1' }
      const res = mockRes()
      await validateCartForCheckout(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
