import { jest, describe, it, expect, beforeEach } from '@jest/globals'

/*
 Unit tests for controllers/product.controller.js
 Testing USER-FACING APIs only:
 - getProductController
 - getProductByCategory
 - getProductByCategoryAndSubCategory
 - getProductDetails
 - searchProduct
*/

// Mock ProductModel
const mockProductFind = jest.fn()
const mockProductFindOne = jest.fn()
const mockProductCountDocuments = jest.fn()

const MockProductModel = {
  find: mockProductFind,
  findOne: mockProductFindOne,
  countDocuments: mockProductCountDocuments
}

// Provide mocks before importing controller
await jest.unstable_mockModule('../../models/product.model.js', () => ({
  __esModule: true,
  default: MockProductModel
}))

const {
  getProductController,
  getProductByCategory,
  getProductByCategoryAndSubCategory,
  getProductDetails,
  searchProduct
} = await import('../../controllers/product.controller.js')

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
  // Reset mock implementations to avoid carry-over between tests
  mockProductFind.mockReset()
  mockProductFindOne.mockReset()
  mockProductCountDocuments.mockReset()
})

describe('product.controller - USER APIs', () => {
  describe('getProductController', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns paginated products with default page and limit', async () => {
      const products = [{ _id: 'p1', name: 'Product 1', publish: true }]
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(1)

      const req = { body: {} }
      const res = mockRes()

      await getProductController(req, res)

      // Should query only published products
      expect(mockProductFind).toHaveBeenCalledWith({ publish: true })
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
      expect(skipMock).toHaveBeenCalledWith(0) // (page 1 - 1) * 10
      expect(limitMock).toHaveBeenCalledWith(10)
      expect(populateMock).toHaveBeenCalledWith('category subCategory')
      expect(mockProductCountDocuments).toHaveBeenCalledWith({ publish: true })
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        error: false,
        data: products,
        totalCount: 1,
        totalNoPage: 1
      }))
    })

    it('returns products with custom page and limit', async () => {
      const products = [{ _id: 'p2' }]
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(25)

      const req = { body: { page: 2, limit: 5 } }
      const res = mockRes()

      await getProductController(req, res)

      expect(skipMock).toHaveBeenCalledWith(5) // (2 - 1) * 5
      expect(limitMock).toHaveBeenCalledWith(5)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        totalCount: 25,
        totalNoPage: 5 // Math.ceil(25/5)
      }))
    })

    it('filters products by text search', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: { search: 'laptop' } }
      const res = mockRes()

      await getProductController(req, res)

      expect(mockProductFind).toHaveBeenCalledWith({
        publish: true,
        $text: { $search: 'laptop' }
      })
    })

    it('returns 500 on error', async () => {
      mockProductFind.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: () => Promise.reject(new Error('db error'))
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: {} }
      const res = mockRes()

      await getProductController(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }))
    })
  })

  describe('getProductByCategory', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns 400 when category id missing', async () => {
      const req = { body: {} }
      const res = mockRes()

      await getProductByCategory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'provide category id',
        error: true
      }))
    })

    it('returns products filtered by category and publish status', async () => {
      const products = [{ _id: 'p1', category: ['cat1'], publish: true }]
      const limitMock = jest.fn().mockResolvedValueOnce(products)
      
      mockProductFind.mockReturnValueOnce({
        limit: limitMock
      })

      const req = { body: { id: ['cat1', 'cat2'] } }
      const res = mockRes()

      await getProductByCategory(req, res)

      // Should filter by category AND publish: true
      expect(mockProductFind).toHaveBeenCalledWith({
        category: { $in: ['cat1', 'cat2'] },
        publish: true
      })
      expect(limitMock).toHaveBeenCalledWith(15)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: products
      }))
    })

    it('returns 500 on error', async () => {
      mockProductFind.mockReturnValueOnce({
        limit: () => Promise.reject(new Error('error'))
      })

      const req = { body: { id: ['cat1'] } }
      const res = mockRes()

      await getProductByCategory(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getProductByCategoryAndSubCategory', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns 400 when categoryId or subCategoryId missing', async () => {
      const req1 = { body: { categoryId: ['c1'] } }
      const res1 = mockRes()
      await getProductByCategoryAndSubCategory(req1, res1)
      expect(res1.status).toHaveBeenCalledWith(400)

      const req2 = { body: { subCategoryId: ['s1'] } }
      const res2 = mockRes()
      await getProductByCategoryAndSubCategory(req2, res2)
      expect(res2.status).toHaveBeenCalledWith(400)
    })

    it('returns products filtered by category, subcategory and publish status', async () => {
      const products = [{ _id: 'p1' }]
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(1)

      const req = { 
        body: { 
          categoryId: ['c1'], 
          subCategoryId: ['s1', 's2'],
          page: 1,
          limit: 10
        } 
      }
      const res = mockRes()

      await getProductByCategoryAndSubCategory(req, res)

      expect(mockProductFind).toHaveBeenCalledWith({
        category: { $in: ['c1'] },
        subCategory: { $in: ['s1', 's2'] },
        publish: true
      })
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: products,
        totalCount: 1
      }))
    })

    it('returns 500 on error', async () => {
      mockProductFind.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: () => Promise.reject(new Error('error'))
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: { categoryId: ['c1'], subCategoryId: ['s1'] } }
      const res = mockRes()

      await getProductByCategoryAndSubCategory(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getProductDetails', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns 404 when product not found', async () => {
      mockProductFindOne.mockResolvedValueOnce(null)

      const req = { body: { productId: 'p999' } }
      const res = mockRes()

      await getProductDetails(req, res)

      expect(mockProductFindOne).toHaveBeenCalledWith({ _id: 'p999' })
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Product not found',
        error: true
      }))
    })

    it('returns product details with isDiscontinued flag when publish is false', async () => {
      const product = { _id: 'p1', name: 'Product', publish: false }
      mockProductFindOne.mockResolvedValueOnce(product)

      const req = { body: { productId: 'p1' } }
      const res = mockRes()

      await getProductDetails(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: product,
        isDiscontinued: true // !product.publish
      }))
    })

    it('returns product details with isDiscontinued false when publish is true', async () => {
      const product = { _id: 'p1', name: 'Product', publish: true }
      mockProductFindOne.mockResolvedValueOnce(product)

      const req = { body: { productId: 'p1' } }
      const res = mockRes()

      await getProductDetails(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: product,
        isDiscontinued: false
      }))
    })

    it('returns 500 on error', async () => {
      mockProductFindOne.mockRejectedValueOnce(new Error('db error'))

      const req = { body: { productId: 'p1' } }
      const res = mockRes()

      await getProductDetails(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('searchProduct', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('searches products with default pagination and only published', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: {} }
      const res = mockRes()

      await searchProduct(req, res)

      // Should only search published products
      expect(mockProductFind).toHaveBeenCalledWith({ publish: true })
      expect(limitMock).toHaveBeenCalledWith(8) // default limit
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: products
      }))
    })

    it('searches products by text with regex', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: { search: 'laptop' } }
      const res = mockRes()

      await searchProduct(req, res)

      const callArg = mockProductFind.mock.calls[0][0]
      expect(callArg.publish).toBe(true)
      expect(callArg.$or).toBeDefined()
      expect(callArg.$or.length).toBe(2)
    })

    it('filters by category and subcategory', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { 
        body: { 
          categoryId: ['c1', 'c2'],
          subCategoryId: ['s1']
        } 
      }
      const res = mockRes()

      await searchProduct(req, res)

      expect(mockProductFind).toHaveBeenCalledWith(expect.objectContaining({
        publish: true,
        category: { $in: ['c1', 'c2'] },
        subCategory: { $in: ['s1'] }
      }))
    })

    it('filters by price range', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { 
        body: { 
          minPrice: 100,
          maxPrice: 500
        } 
      }
      const res = mockRes()

      await searchProduct(req, res)

      expect(mockProductFind).toHaveBeenCalledWith(expect.objectContaining({
        publish: true,
        price: { $gte: 100, $lte: 500 }
      }))
    })

    it('sorts by price ascending', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: { sortBy: 'price_asc' } }
      const res = mockRes()

      await searchProduct(req, res)

      expect(sortMock).toHaveBeenCalledWith({ price: 1 })
    })

    it('sorts by price descending', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: { sortBy: 'price_desc' } }
      const res = mockRes()

      await searchProduct(req, res)

      expect(sortMock).toHaveBeenCalledWith({ price: -1 })
    })

    it('sorts by name', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: { sortBy: 'name' } }
      const res = mockRes()

      await searchProduct(req, res)

      expect(sortMock).toHaveBeenCalledWith({ name: 1 })
    })

    it('defaults to sort by createdAt descending', async () => {
      const products = []
      const sortMock = jest.fn().mockReturnThis()
      const skipMock = jest.fn().mockReturnThis()
      const limitMock = jest.fn().mockReturnThis()
      const populateMock = jest.fn().mockResolvedValueOnce(products)

      mockProductFind.mockReturnValueOnce({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        populate: populateMock
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: {} }
      const res = mockRes()

      await searchProduct(req, res)

      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
    })

    it('returns 500 on error', async () => {
      mockProductFind.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: () => Promise.reject(new Error('error'))
      })
      mockProductCountDocuments.mockResolvedValueOnce(0)

      const req = { body: {} }
      const res = mockRes()

      await searchProduct(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
