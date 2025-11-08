import { jest } from '@jest/globals';

// ═══════════════════════════════════════════════════════════
// MOCK SETUP
// ═══════════════════════════════════════════════════════════

const mockOrderModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    insertMany: jest.fn()
};

const mockCartProductModel = {
    deleteMany: jest.fn()
};

const mockUserModel = {
    findById: jest.fn(),
    updateOne: jest.fn(),
    findByIdAndUpdate: jest.fn()
};

const mockProductModel = {
    findById: jest.fn()
};

const mockStripe = {
    checkout: {
        sessions: {
            create: jest.fn(),
            listLineItems: jest.fn()
        }
    },
    products: {
        retrieve: jest.fn()
    }
};

await jest.unstable_mockModule('../../models/order.model.js', () => ({
    default: mockOrderModel
}));

await jest.unstable_mockModule('../../models/cartproduct.model.js', () => ({
    default: mockCartProductModel
}));

await jest.unstable_mockModule('../../models/user.model.js', () => ({
    default: mockUserModel
}));

await jest.unstable_mockModule('../../models/product.model.js', () => ({
    default: mockProductModel
}));

await jest.unstable_mockModule('../../config/stripe.js', () => ({
    default: mockStripe
}));

const {
    CashOnDeliveryOrderController,
    getOrderDetailsController,
    cancelOrderController
} = await import('../../controllers/order.controller.js');

// ═══════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════

describe('Order Controller - USER APIs', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockOrderModel.create.mockReset();
        mockOrderModel.find.mockReset();
        mockOrderModel.findOne.mockReset();
        mockOrderModel.insertMany.mockReset();
        mockCartProductModel.deleteMany.mockReset();
        mockUserModel.findById.mockReset();
        mockUserModel.updateOne.mockReset();
        mockUserModel.findByIdAndUpdate.mockReset();
        mockProductModel.findById.mockReset();
        mockStripe.checkout.sessions.create.mockReset();
        mockStripe.checkout.sessions.listLineItems.mockReset();
        mockStripe.products.retrieve.mockReset();

        mockRequest = {
            userId: 'user123',
            body: {},
            params: {}
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    // ═══════════════════════════════════════════════════════════
    // CASH ON DELIVERY ORDER
    // ═══════════════════════════════════════════════════════════

    describe('CashOnDeliveryOrderController', () => {
        beforeEach(() => {
            mockRequest.body = {
                list_items: [
                    {
                        productId: {
                            _id: 'prod1',
                            name: 'Product 1',
                            image: ['img1.jpg'],
                            price: 100,
                            stock: 10,
                            publish: true
                        },
                        quantity: 2
                    }
                ],
                totalAmt: 200,
                addressId: 'addr123',
                subTotalAmt: 200
            };
        });

        it('should create COD order successfully', async () => {
            const mockProduct = {
                _id: 'prod1',
                name: 'Product 1',
                image: ['img1.jpg'],
                price: 100,
                stock: 10,
                publish: true,
                save: jest.fn().mockResolvedValue(true)
            };

            mockProductModel.findById.mockResolvedValue(mockProduct);

            const mockOrder = {
                _id: 'order123',
                orderId: 'ORD-123',
                userId: 'user123',
                items: [
                    {
                        productId: 'prod1',
                        name: 'Product 1',
                        quantity: 2,
                        price: 100,
                        subTotal: 200
                    }
                ],
                payment_status: 'CASH ON DELIVERY',
                totalAmt: 200
            };

            mockOrderModel.create.mockResolvedValue(mockOrder);
            mockCartProductModel.deleteMany.mockResolvedValue({ deletedCount: 1 });
            mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

            await CashOnDeliveryOrderController(mockRequest, mockResponse);

            expect(mockProductModel.findById).toHaveBeenCalledWith('prod1');
            expect(mockProduct.save).toHaveBeenCalled();
            expect(mockProduct.stock).toBe(8); // 10 - 2
            expect(mockOrderModel.create).toHaveBeenCalled();
            expect(mockCartProductModel.deleteMany).toHaveBeenCalledWith({ userId: 'user123' });
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: 'user123' },
                { shopping_cart: [] }
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Order created successfully',
                    success: true,
                    data: mockOrder
                })
            );
        });

        it('should return 400 if product does not exist', async () => {
            mockProductModel.findById.mockResolvedValue(null);

            await CashOnDeliveryOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Không thể tạo đơn hàng',
                    success: false,
                    error: true
                })
            );
        });

        it('should return 400 if product is discontinued', async () => {
            const mockProduct = {
                _id: 'prod1',
                name: 'Product 1',
                stock: 10,
                publish: false // ngừng bán
            };

            mockProductModel.findById.mockResolvedValue(mockProduct);

            await CashOnDeliveryOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Không thể tạo đơn hàng',
                    errors: expect.arrayContaining([
                        expect.stringContaining('đã ngừng bán')
                    ]),
                    success: false,
                    error: true
                })
            );
        });

        it('should return 400 if insufficient stock', async () => {
            const mockProduct = {
                _id: 'prod1',
                name: 'Product 1',
                stock: 1, // chỉ còn 1
                publish: true
            };

            mockProductModel.findById.mockResolvedValue(mockProduct);

            await CashOnDeliveryOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Không thể tạo đơn hàng',
                    errors: expect.arrayContaining([
                        expect.stringContaining('chỉ còn 1 trong kho')
                    ]),
                    success: false,
                    error: true
                })
            );
        });

        it('should return 400 if stock deduction fails', async () => {
            const mockProduct = {
                _id: 'prod1',
                name: 'Product 1',
                stock: 10,
                publish: true,
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            };

            mockProductModel.findById.mockResolvedValue(mockProduct);

            await CashOnDeliveryOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Lỗi khi trừ tồn kho',
                    success: false,
                    error: true
                })
            );
        });

        it('should handle multiple items in order', async () => {
            mockRequest.body.list_items = [
                {
                    productId: {
                        _id: 'prod1',
                        name: 'Product 1',
                        image: ['img1.jpg'],
                        price: 100,
                        stock: 10,
                        publish: true
                    },
                    quantity: 2
                },
                {
                    productId: {
                        _id: 'prod2',
                        name: 'Product 2',
                        image: ['img2.jpg'],
                        price: 50,
                        stock: 5,
                        publish: true
                    },
                    quantity: 1
                }
            ];

            const mockProduct1 = {
                _id: 'prod1',
                name: 'Product 1',
                stock: 10,
                publish: true,
                save: jest.fn().mockResolvedValue(true)
            };

            const mockProduct2 = {
                _id: 'prod2',
                name: 'Product 2',
                stock: 5,
                publish: true,
                save: jest.fn().mockResolvedValue(true)
            };

            // Validation phase (2 calls) + Deduction phase (2 calls) = 4 calls total
            mockProductModel.findById
                .mockResolvedValueOnce(mockProduct1) // validation prod1
                .mockResolvedValueOnce(mockProduct2) // validation prod2
                .mockResolvedValueOnce(mockProduct1) // deduction prod1
                .mockResolvedValueOnce(mockProduct2); // deduction prod2

            mockOrderModel.create.mockResolvedValue({ orderId: 'ORD-123' });
            mockCartProductModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
            mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

            await CashOnDeliveryOrderController(mockRequest, mockResponse);

            expect(mockProductModel.findById).toHaveBeenCalledTimes(4); // 2 validation + 2 deduction
            expect(mockProduct1.stock).toBe(8); // 10 - 2
            expect(mockProduct2.stock).toBe(4); // 5 - 1
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 500 on server error', async () => {
            mockProductModel.findById.mockRejectedValue(new Error('Server error'));

            await CashOnDeliveryOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Server error',
                    error: true,
                    success: false
                })
            );
        });
    });

    // ═══════════════════════════════════════════════════════════
    // GET ORDER DETAILS
    // ═══════════════════════════════════════════════════════════

    describe('getOrderDetailsController', () => {
        it('should return user order list successfully', async () => {
            const mockOrders = [
                {
                    _id: 'order1',
                    orderId: 'ORD-001',
                    userId: 'user123',
                    items: [
                        {
                            productId: {
                                _id: 'prod1',
                                name: 'Product 1',
                                image: ['img1.jpg'],
                                price: 100,
                                stock: 10,
                                publish: true
                            },
                            quantity: 2
                        }
                    ],
                    totalAmt: 200,
                    order_status: 'pending',
                    delivery_address: {
                        _id: 'addr123',
                        address_line: '123 Street',
                        city: 'City'
                    }
                }
            ];

            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis()
            };

            // Chain: .populate('delivery_address').populate('items.productId', ...)
            mockFind.populate.mockReturnValueOnce(mockFind).mockResolvedValueOnce(mockOrders);
            mockOrderModel.find.mockReturnValue(mockFind);

            await getOrderDetailsController(mockRequest, mockResponse);

            expect(mockOrderModel.find).toHaveBeenCalledWith({ userId: 'user123' });
            expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockFind.populate).toHaveBeenCalledWith('delivery_address');
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'order list',
                data: mockOrders,
                error: false,
                success: true
            });
        });

        it('should return empty array if no orders found', async () => {
            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis()
            };

            // Chain: .populate('delivery_address').populate('items.productId', ...)
            mockFind.populate.mockReturnValueOnce(mockFind).mockResolvedValueOnce([]);
            mockOrderModel.find.mockReturnValue(mockFind);

            await getOrderDetailsController(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'order list',
                data: [],
                error: false,
                success: true
            });
        });

        it('should return 500 on server error', async () => {
            mockOrderModel.find.mockImplementation(() => {
                throw new Error('Database error');
            });

            await getOrderDetailsController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Database error',
                    error: true,
                    success: false
                })
            );
        });
    });

    // ═══════════════════════════════════════════════════════════
    // CANCEL ORDER
    // ═══════════════════════════════════════════════════════════

    describe('cancelOrderController', () => {
        beforeEach(() => {
            mockRequest.params = {
                orderId: 'order123'
            };
        });

        it('should cancel order successfully and restore stock', async () => {
            const mockOrder = {
                _id: 'order123',
                orderId: 'ORD-001',
                userId: 'user123',
                items: [
                    {
                        productId: 'prod1',
                        name: 'Product 1',
                        quantity: 2
                    }
                ],
                order_status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            const mockProduct = {
                _id: 'prod1',
                name: 'Product 1',
                stock: 8,
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);
            mockProductModel.findById.mockResolvedValue(mockProduct);

            await cancelOrderController(mockRequest, mockResponse);

            // orderId 'order123' is NOT a valid MongoDB ObjectId, so it uses orderId field
            expect(mockOrderModel.findOne).toHaveBeenCalledWith({
                orderId: 'order123',
                userId: 'user123'
            });
            expect(mockProductModel.findById).toHaveBeenCalledWith('prod1');
            expect(mockProduct.stock).toBe(10); // 8 + 2 restored
            expect(mockOrder.order_status).toBe('cancelled');
            expect(mockOrder.save).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('hủy'),
                    success: true,
                    error: false
                })
            );
        });

        it('should return 404 if order not found', async () => {
            mockOrderModel.findOne.mockResolvedValue(null);

            await cancelOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Order not found',
                error: true,
                success: false
            });
        });

        it('should return 400 if order status is not pending', async () => {
            const mockOrder = {
                _id: 'order123',
                orderId: 'ORD-001',
                userId: 'user123',
                order_status: 'delivered' // không thể hủy
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            await cancelOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý',
                error: true,
                success: false
            });
        });

        it('should handle orderId as MongoDB ObjectId', async () => {
            mockRequest.params.orderId = '507f1f77bcf86cd799439011'; // valid ObjectId

            const mockOrder = {
                _id: '507f1f77bcf86cd799439011',
                userId: 'user123',
                items: [],
                order_status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            await cancelOrderController(mockRequest, mockResponse);

            expect(mockOrderModel.findOne).toHaveBeenCalledWith({
                _id: '507f1f77bcf86cd799439011',
                userId: 'user123'
            });
        });

        it('should handle orderId as custom string', async () => {
            mockRequest.params.orderId = 'ORD-001'; // custom orderId

            const mockOrder = {
                _id: 'order123',
                orderId: 'ORD-001',
                userId: 'user123',
                items: [],
                order_status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            await cancelOrderController(mockRequest, mockResponse);

            expect(mockOrderModel.findOne).toHaveBeenCalledWith({
                orderId: 'ORD-001',
                userId: 'user123'
            });
        });

        it('should handle multiple items stock restoration', async () => {
            const mockOrder = {
                _id: 'order123',
                orderId: 'ORD-001',
                userId: 'user123',
                items: [
                    {
                        productId: 'prod1',
                        name: 'Product 1',
                        quantity: 2
                    },
                    {
                        productId: 'prod2',
                        name: 'Product 2',
                        quantity: 3
                    }
                ],
                order_status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            const mockProduct1 = {
                _id: 'prod1',
                name: 'Product 1',
                stock: 8,
                save: jest.fn().mockResolvedValue(true)
            };

            const mockProduct2 = {
                _id: 'prod2',
                name: 'Product 2',
                stock: 5,
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);
            mockProductModel.findById
                .mockResolvedValueOnce(mockProduct1)
                .mockResolvedValueOnce(mockProduct2);

            await cancelOrderController(mockRequest, mockResponse);

            expect(mockProduct1.stock).toBe(10); // 8 + 2
            expect(mockProduct2.stock).toBe(8); // 5 + 3
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    stockUpdates: expect.arrayContaining([
                        expect.objectContaining({
                            productName: 'Product 1',
                            action: 'restored'
                        }),
                        expect.objectContaining({
                            productName: 'Product 2',
                            action: 'restored'
                        })
                    ])
                })
            );
        });

        it('should return 500 on server error', async () => {
            mockOrderModel.findOne.mockRejectedValue(new Error('Database error'));

            await cancelOrderController(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Database error',
                    error: true,
                    success: false
                })
            );
        });
    });
});
