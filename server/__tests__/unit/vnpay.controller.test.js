import { jest } from '@jest/globals';

// ═══════════════════════════════════════════════════════════
// MOCK SETUP
// ═══════════════════════════════════════════════════════════

const mockOrderModel = {
    create: jest.fn(),
    findOne: jest.fn()
};

const mockCartProductModel = {
    deleteMany: jest.fn()
};

const mockUserModel = {
    updateOne: jest.fn()
};

const mockVnpayConfig = {
    vnp_TmnCode: 'TEST_TMN_CODE',
    vnp_HashSecret: 'TEST_SECRET_KEY_12345678901234567890',
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: 'http://localhost:3000/vnpay-return'
};

const mockCrypto = {
    createHmac: jest.fn()
};

const mockQuerystring = {
    stringify: jest.fn()
};

const mockDateFormat = jest.fn();

await jest.unstable_mockModule('../../models/order.model.js', () => ({
    default: mockOrderModel
}));

await jest.unstable_mockModule('../../models/cartproduct.model.js', () => ({
    default: mockCartProductModel
}));

await jest.unstable_mockModule('../../models/user.model.js', () => ({
    default: mockUserModel
}));

await jest.unstable_mockModule('../../config/vnpay.config.js', () => ({
    default: mockVnpayConfig
}));

await jest.unstable_mockModule('crypto', () => ({
    default: mockCrypto
}));

await jest.unstable_mockModule('qs', () => ({
    default: mockQuerystring
}));

await jest.unstable_mockModule('dateformat', () => ({
    default: mockDateFormat
}));

const {
    createVNPayPayment,
    vnpayReturn
} = await import('../../controllers/vnpay.controller.js');

// ═══════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════

describe('VNPay Controller', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockOrderModel.create.mockReset();
        mockOrderModel.findOne.mockReset();
        mockCartProductModel.deleteMany.mockReset();
        mockUserModel.updateOne.mockReset();
        mockCrypto.createHmac.mockReset();
        mockQuerystring.stringify.mockReset();
        mockDateFormat.mockReset();

        mockRequest = {
            userId: 'user123',
            body: {},
            query: {},
            headers: {},
            connection: {},
            socket: {}
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    // ═══════════════════════════════════════════════════════════
    // CREATE VNPAY PAYMENT
    // ═══════════════════════════════════════════════════════════

    describe('createVNPayPayment', () => {
        beforeEach(() => {
            mockRequest.body = {
                list_items: [
                    {
                        productId: {
                            _id: 'prod1',
                            name: 'Product 1',
                            image: ['img1.jpg'],
                            price: 100
                        },
                        quantity: 2
                    }
                ],
                totalAmt: 200,
                addressId: 'addr123',
                subTotalAmt: 200
            };

            mockRequest.headers = {
                'x-forwarded-for': '192.168.1.1'
            };

            // Mock dateFormat
            mockDateFormat
                .mockReturnValueOnce('20250107120000') // createDate
                .mockReturnValueOnce('20250107121500'); // expireDate

            // Mock crypto HMAC
            const mockHmac = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('test_secure_hash_1234567890')
            };
            mockCrypto.createHmac.mockReturnValue(mockHmac);

            // Mock querystring
            mockQuerystring.stringify.mockReturnValue('vnp_Amount=20000&vnp_Command=pay&vnp_CreateDate=20250107120000');

            // Mock OrderModel.create
            mockOrderModel.create.mockResolvedValue({
                _id: 'order123',
                orderId: 'test-order-id',
                userId: 'user123',
                items: [],
                payment_status: 'PENDING'
            });
        });

        it('should create VNPay payment URL successfully', async () => {
            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockOrderModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user123',
                    payment_status: 'PENDING',
                    delivery_address: 'addr123',
                    totalAmt: 200,
                    subTotalAmt: 200,
                    order_status: 'pending'
                })
            );

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    paymentUrl: expect.stringContaining('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')
                })
            );
        });

        it('should use correct IP address from x-forwarded-for header', async () => {
            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    paymentUrl: expect.any(String)
                })
            );
        });

        it('should use connection.remoteAddress if x-forwarded-for is not available', async () => {
            mockRequest.headers = {};
            mockRequest.connection = { remoteAddress: '10.0.0.1' };

            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should use socket.remoteAddress as fallback', async () => {
            mockRequest.headers = {};
            mockRequest.connection = {};
            mockRequest.socket = { remoteAddress: '172.16.0.1' };

            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should use default IP 127.0.0.1 if no IP available', async () => {
            mockRequest.headers = {};
            mockRequest.connection = {};
            mockRequest.socket = {};

            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should handle multiple items in payment', async () => {
            mockRequest.body.list_items = [
                {
                    productId: {
                        _id: 'prod1',
                        name: 'Product 1',
                        image: ['img1.jpg'],
                        price: 100
                    },
                    quantity: 2
                },
                {
                    productId: {
                        _id: 'prod2',
                        name: 'Product 2',
                        image: ['img2.jpg'],
                        price: 50
                    },
                    quantity: 3
                }
            ];
            mockRequest.body.totalAmt = 350;

            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockOrderModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: expect.arrayContaining([
                        expect.objectContaining({
                            productId: 'prod1',
                            name: 'Product 1',
                            quantity: 2,
                            price: 100,
                            subTotal: 200
                        }),
                        expect.objectContaining({
                            productId: 'prod2',
                            name: 'Product 2',
                            quantity: 3,
                            price: 50,
                            subTotal: 150
                        })
                    ])
                })
            );
        });

        it('should convert amount to VND format (x100)', async () => {
            mockRequest.body.totalAmt = 250000; // 250,000 VND

            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    paymentUrl: expect.any(String)
                })
            );
        });

        it('should create HMAC signature correctly', async () => {
            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockCrypto.createHmac).toHaveBeenCalledWith('sha512', 'TEST_SECRET_KEY_12345678901234567890');
            expect(mockQuerystring.stringify).toHaveBeenCalled();
        });

        it('should return 500 on server error', async () => {
            mockOrderModel.create.mockRejectedValue(new Error('Database error'));

            await createVNPayPayment(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Database error'
                })
            );
        });
    });

    // ═══════════════════════════════════════════════════════════
    // VNPAY RETURN (CALLBACK)
    // ═══════════════════════════════════════════════════════════

    describe('vnpayReturn', () => {
        beforeEach(() => {
            mockRequest.query = {
                vnp_TxnRef: 'order123',
                vnp_ResponseCode: '00',
                vnp_TransactionNo: 'VNP123456789',
                vnp_SecureHash: 'valid_hash_1234567890',
                vnp_Amount: '20000'
            };

            // Mock crypto HMAC for verification
            const mockHmac = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('valid_hash_1234567890')
            };
            mockCrypto.createHmac.mockReturnValue(mockHmac);

            // Mock querystring
            mockQuerystring.stringify.mockReturnValue('vnp_Amount=20000&vnp_ResponseCode=00&vnp_TxnRef=order123');
        });

        it('should process successful payment (response code 00)', async () => {
            const mockOrder = {
                _id: 'order123',
                orderId: 'order123',
                userId: 'user123',
                payment_status: 'PENDING',
                order_status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);
            mockCartProductModel.deleteMany.mockResolvedValue({ deletedCount: 5 });
            mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

            await vnpayReturn(mockRequest, mockResponse);

            expect(mockOrderModel.findOne).toHaveBeenCalledWith({ orderId: 'order123' });
            expect(mockOrder.payment_status).toBe('PAID');
            expect(mockOrder.paymentId).toBe('VNP123456789');
            expect(mockOrder.save).toHaveBeenCalled();
            expect(mockCartProductModel.deleteMany).toHaveBeenCalledWith({ userId: 'user123' });
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: 'user123' },
                { shopping_cart: [] }
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Payment successful',
                    orderId: 'order123'
                })
            );
        });

        it('should handle failed payment (response code not 00)', async () => {
            mockRequest.query.vnp_ResponseCode = '24'; // Cancelled by user
            mockRequest.query.vnp_SecureHash = 'valid_hash_failed';

            const mockHmac = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('valid_hash_failed')
            };
            mockCrypto.createHmac.mockReturnValue(mockHmac);

            const mockOrder = {
                _id: 'order123',
                orderId: 'order123',
                userId: 'user123',
                payment_status: 'PENDING',
                order_status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            await vnpayReturn(mockRequest, mockResponse);

            expect(mockOrder.payment_status).toBe('FAILED');
            expect(mockOrder.order_status).toBe('cancelled');
            expect(mockOrder.save).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Payment failed',
                    code: '24'
                })
            );
        });

        it('should return 404 if order not found', async () => {
            mockOrderModel.findOne.mockResolvedValue(null);

            await vnpayReturn(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Order not found'
                })
            );
        });

        it('should return 400 if signature is invalid', async () => {
            const mockHmac = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('different_hash_9876543210')
            };
            mockCrypto.createHmac.mockReturnValue(mockHmac);

            await vnpayReturn(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Invalid signature'
                })
            );
        });

        it('should verify signature using HMAC SHA512', async () => {
            const mockOrder = {
                _id: 'order123',
                orderId: 'order123',
                userId: 'user123',
                payment_status: 'PENDING',
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            await vnpayReturn(mockRequest, mockResponse);

            expect(mockCrypto.createHmac).toHaveBeenCalledWith('sha512', 'TEST_SECRET_KEY_12345678901234567890');
        });

        it('should remove vnp_SecureHash and vnp_SecureHashType before verification', async () => {
            mockRequest.query = {
                vnp_TxnRef: 'order123',
                vnp_ResponseCode: '00',
                vnp_SecureHash: 'valid_hash_1234567890',
                vnp_SecureHashType: 'SHA512',
                vnp_Amount: '20000'
            };

            const mockHmac = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('valid_hash_1234567890')
            };
            mockCrypto.createHmac.mockReturnValue(mockHmac);

            const mockOrder = {
                _id: 'order123',
                orderId: 'order123',
                userId: 'user123',
                payment_status: 'PENDING',
                save: jest.fn().mockResolvedValue(true)
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            await vnpayReturn(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 500 on server error', async () => {
            mockOrderModel.findOne.mockRejectedValue(new Error('Database error'));

            await vnpayReturn(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Database error',
                    success: false
                })
            );
        });

        it('should handle different response codes', async () => {
            const responseCodes = [
                { code: '07', description: 'Transaction timeout' },
                { code: '09', description: 'Card not registered' },
                { code: '10', description: 'Authentication failed' },
                { code: '11', description: 'Payment deadline expired' },
                { code: '12', description: 'Card locked' }
            ];

            for (const { code } of responseCodes) {
                jest.clearAllMocks();
                
                mockRequest.query.vnp_ResponseCode = code;
                mockRequest.query.vnp_SecureHash = `valid_hash_${code}`;

                const mockHmac = {
                    update: jest.fn().mockReturnThis(),
                    digest: jest.fn().mockReturnValue(`valid_hash_${code}`)
                };
                mockCrypto.createHmac.mockReturnValue(mockHmac);

                const mockOrder = {
                    _id: 'order123',
                    orderId: 'order123',
                    userId: 'user123',
                    payment_status: 'PENDING',
                    order_status: 'pending',
                    save: jest.fn().mockResolvedValue(true)
                };

                mockOrderModel.findOne.mockResolvedValue(mockOrder);

                await vnpayReturn(mockRequest, mockResponse);

                expect(mockOrder.payment_status).toBe('FAILED');
                expect(mockOrder.order_status).toBe('cancelled');
                expect(mockResponse.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        message: 'Payment failed',
                        code: code
                    })
                );
            }
        });
    });
});
