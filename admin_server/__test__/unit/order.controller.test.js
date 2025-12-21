import { jest } from '@jest/globals'

describe('Admin Order Controller - Unit Tests', () => {
  let updateOrderStatusController
  let cancelOrderController
  let getAllOrdersAdminController
  let getOrderDetailsController
  let OrderModel
  let ProductModel
  let getIO
  
  let mockRequest
  let mockResponse

  beforeAll(async () => {
    // Import modules
    const orderModelModule = await import('../../models/order.model.js')
    OrderModel = orderModelModule.default
    
    const productModelModule = await import('../../models/product.model.js')
    ProductModel = productModelModule.default
    
    // Mock Socket.IO trước khi import controller
    const socketModule = await import('../../socket/index.js')
    getIO = socketModule.getIO
    
    // Mock getIO function
    const mockSocket = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    }
    getIO.mockReturnValue = jest.fn(() => mockSocket)
    
    // Spy on methods
    jest.spyOn(OrderModel, 'findOne')
    jest.spyOn(OrderModel, 'find')
    jest.spyOn(ProductModel, 'findById')
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Import controllers
    const controllerModule = await import('../../controllers/order.controller.js')
    updateOrderStatusController = controllerModule.updateOrderStatusController
    cancelOrderController = controllerModule.cancelOrderController
    getAllOrdersAdminController = controllerModule.getAllOrdersAdminController
    getOrderDetailsController = controllerModule.getOrderDetailsController
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockRequest = {
      params: {},
      body: {},
      userId: null
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('getAllOrdersAdminController', () => {
    test('TC001: Lấy tất cả đơn hàng thành công', async () => {
      const mockOrders = [
        {
          _id: 'order-id-1',
          orderId: 'ORD001',
          order_status: 'pending',
          totalAmt: 100000,
          userId: { _id: 'user-1', name: 'User 1', email: 'user1@test.com' },
          delivery_address: { address_line: '123 Street', city: 'HCM' },
          items: []
        },
        {
          _id: 'order-id-2',
          orderId: 'ORD002',
          order_status: 'confirmed',
          totalAmt: 200000,
          userId: { _id: 'user-2', name: 'User 2', email: 'user2@test.com' },
          delivery_address: { address_line: '456 Street', city: 'HN' },
          items: []
        }
      ]

      // Mock chain: find().sort().populate().populate().populate()
      const mockChain = {
        sort: jest.fn(),
        populate: jest.fn()
      }
      
      // Setup chain
      mockChain.sort.mockReturnValue(mockChain)
      mockChain.populate
        .mockReturnValueOnce(mockChain)  // First populate
        .mockReturnValueOnce(mockChain)  // Second populate  
        .mockResolvedValueOnce(mockOrders) // Third populate returns data

      OrderModel.find.mockReturnValue(mockChain)

      await getAllOrdersAdminController(mockRequest, mockResponse)

      expect(OrderModel.find).toHaveBeenCalledWith({})
      expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All orders with client details',
        data: mockOrders,
        success: true,
        error: false
      })
    })

    test('TC002: Lỗi khi lấy danh sách đơn hàng', async () => {
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis()
      }
      
      // Mock để throw error khi populate được gọi lần cuối
      mockFind.populate.mockImplementation(() => {
        throw new Error('Database error')
      })

      OrderModel.find.mockReturnValue(mockFind)

      await getAllOrdersAdminController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Database error',
        success: false,
        error: true
      })
    })
  })

  describe('getOrderDetailsController', () => {
    test('TC003: Lấy chi tiết đơn hàng của user thành công', async () => {
      mockRequest.userId = 'user-123'

      const mockOrders = [
        {
          _id: 'order-1',
          orderId: 'ORD001',
          userId: 'user-123',
          order_status: 'pending',
          totalAmt: 100000
        }
      ]

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockOrders)
      }

      OrderModel.find.mockReturnValue(mockFind)

      await getOrderDetailsController(mockRequest, mockResponse)

      expect(OrderModel.find).toHaveBeenCalledWith({ userId: 'user-123' })
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'order list',
        data: mockOrders,
        error: false,
        success: true
      })
    })
  })

  describe('updateOrderStatusController', () => {
    test('TC004: Cập nhật trạng thái đơn hàng thành công', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'confirmed' }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'pending',
        items: [],
        save: jest.fn().mockResolvedValue(true)
      }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(mockOrder)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockOrder.save).toHaveBeenCalled()
      expect(mockOrder.order_status).toBe('confirmed')
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order status updated successfully',
        data: mockOrder,
        error: false,
        success: true
      })
    })

    test('TC005: Trạng thái không hợp lệ - trả về lỗi 400', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'invalid_status' }

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid order_status value',
        error: true,
        success: false
      })
    })

    test('TC006: Đơn hàng không tồn tại - trả về lỗi 404', async () => {
      mockRequest.params = { orderId: 'non-existent' }
      mockRequest.body = { order_status: 'confirmed' }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(null)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order not found',
        error: true,
        success: false
      })
    })

    test('TC007: Trạng thái không thay đổi - trả về success', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'pending' }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        order_status: 'pending',
        items: []
      }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(mockOrder)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order status unchanged',
        data: mockOrder,
        error: false,
        success: true
      })
    })

    test('TC008: Chuyển trạng thái không hợp lệ - trả về lỗi 400', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'confirmed' }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        order_status: 'delivered', // Đã delivered không thể chuyển sang confirmed
        items: []
      }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(mockOrder)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid transition from delivered to confirmed',
        error: true,
        success: false
      })
    })

    test('TC009: Hủy đơn hàng và hoàn tồn kho thành công', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'cancelled' }

      const mockProduct = {
        _id: 'product-1',
        name: 'Product 1',
        stock: 10,
        save: jest.fn().mockResolvedValue(true)
      }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'pending',
        items: [
          {
            productId: 'product-1',
            quantity: 2,
            name: 'Product 1'
          }
        ],
        save: jest.fn().mockResolvedValue(true)
      }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(mockOrder)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)
      ProductModel.findById.mockResolvedValue(mockProduct)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockProduct.stock).toBe(12) // 10 + 2
      expect(mockProduct.save).toHaveBeenCalled()
      expect(mockOrder.order_status).toBe('cancelled')
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order cancelled and stock restored successfully',
          data: mockOrder,
          error: false,
          success: true
        })
      )
    })

    test('TC010: Từ pending sang confirmed - hợp lệ', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'confirmed' }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'pending',
        items: [],
        save: jest.fn().mockResolvedValue(true)
      }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(mockOrder)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockOrder.order_status).toBe('confirmed')
      expect(mockOrder.save).toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order status updated successfully',
        data: mockOrder,
        error: false,
        success: true
      })
    })

    test('TC011: Từ confirmed sang shipping - hợp lệ', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'shipping' }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'confirmed',
        items: [],
        save: jest.fn().mockResolvedValue(true)
      }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(mockOrder)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockOrder.order_status).toBe('shipping')
      expect(mockOrder.save).toHaveBeenCalled()
    })

    test('TC012: Từ shipping sang delivered - hợp lệ', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.body = { order_status: 'delivered' }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'shipping',
        items: [],
        save: jest.fn().mockResolvedValue(true)
      }

      const mockFindOne = {
        populate: jest.fn().mockResolvedValue(mockOrder)
      }

      OrderModel.findOne.mockReturnValue(mockFindOne)

      await updateOrderStatusController(mockRequest, mockResponse)

      expect(mockOrder.order_status).toBe('delivered')
      expect(mockOrder.save).toHaveBeenCalled()
    })
  })

  describe('cancelOrderController', () => {
    test('TC013: Hủy đơn hàng pending thành công', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.userId = 'user-123'

      const mockProduct = {
        _id: 'product-1',
        name: 'Product 1',
        stock: 5,
        save: jest.fn().mockResolvedValue(true)
      }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'pending',
        items: [
          {
            productId: 'product-1',
            quantity: 3,
            name: 'Product 1'
          }
        ],
        save: jest.fn().mockResolvedValue(true)
      }

      OrderModel.findOne.mockResolvedValue(mockOrder)
      ProductModel.findById.mockResolvedValue(mockProduct)

      await cancelOrderController(mockRequest, mockResponse)

      expect(mockProduct.stock).toBe(8) // 5 + 3
      expect(mockOrder.order_status).toBe('cancelled')
      expect(mockOrder.save).toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order cancelled successfully and stock restored',
          data: mockOrder,
          error: false,
          success: true
        })
      )
    })

    test('TC014: Hủy đơn hàng không tồn tại - trả về lỗi 404', async () => {
      mockRequest.params = { orderId: 'non-existent' }
      mockRequest.userId = 'user-123'

      OrderModel.findOne.mockResolvedValue(null)

      await cancelOrderController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order not found',
        error: true,
        success: false
      })
    })

    test('TC015: Hủy đơn hàng không phải pending - trả về lỗi 400', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.userId = 'user-123'

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'confirmed', // Không phải pending
        items: []
      }

      OrderModel.findOne.mockResolvedValue(mockOrder)

      await cancelOrderController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Only pending orders can be cancelled',
        error: true,
        success: false
      })
    })

    test('TC016: Hủy đơn hàng với nhiều sản phẩm - hoàn tồn kho đúng', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.userId = 'user-123'

      const mockProduct1 = {
        _id: 'product-1',
        name: 'Product 1',
        stock: 10,
        save: jest.fn().mockResolvedValue(true)
      }

      const mockProduct2 = {
        _id: 'product-2',
        name: 'Product 2',
        stock: 20,
        save: jest.fn().mockResolvedValue(true)
      }

      const mockOrder = {
        _id: 'order-123',
        orderId: 'ORD001',
        userId: 'user-123',
        order_status: 'pending',
        items: [
          { productId: 'product-1', quantity: 2, name: 'Product 1' },
          { productId: 'product-2', quantity: 5, name: 'Product 2' }
        ],
        save: jest.fn().mockResolvedValue(true)
      }

      OrderModel.findOne.mockResolvedValue(mockOrder)
      ProductModel.findById
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2)

      await cancelOrderController(mockRequest, mockResponse)

      expect(mockProduct1.stock).toBe(12) // 10 + 2
      expect(mockProduct2.stock).toBe(25) // 20 + 5
      expect(mockOrder.order_status).toBe('cancelled')
    })

    test('TC017: Lỗi database khi hủy đơn - trả về lỗi 500', async () => {
      mockRequest.params = { orderId: 'order-123' }
      mockRequest.userId = 'user-123'

      OrderModel.findOne.mockRejectedValue(new Error('Database error'))

      await cancelOrderController(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: true,
        success: false
      })
    })
  })
})
