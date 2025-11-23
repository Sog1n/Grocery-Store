import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";
import { metrics } from "../middleware/prometheus.middleware.js";

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS - QUẢN LÝ TỒN KHO
// ═══════════════════════════════════════════════════════════

// TRỪ TỒN KHO
async function deductProductStock(items) {
    const stockUpdates = [];
    const errors = [];

    for (const item of items) {
        try {
            const productId = item.productId?._id || item.productId;
            const product = await ProductModel.findById(productId);
            
            if (!product) {
                errors.push({
                    productId: productId,
                    productName: item.name || 'Unknown',
                    message: 'Sản phẩm không tồn tại'
                });
                continue;
            }

            if (!product.publish) {
                errors.push({
                    productId: product._id,
                    productName: product.name,
                    message: 'Sản phẩm đã ngừng bán'
                });
                continue;
            }

            if (product.stock < item.quantity) {
                errors.push({
                    productId: product._id,
                    productName: product.name,
                    message: `Chỉ còn ${product.stock} sản phẩm trong kho (yêu cầu ${item.quantity})`
                });
                continue;
            }

            const oldStock = product.stock;
            product.stock -= item.quantity;
            await product.save();

            stockUpdates.push({
                productId: product._id,
                productName: product.name,
                oldStock: oldStock,
                newStock: product.stock,
                quantity: item.quantity,
                action: 'deducted'
            });

            console.log(`✅ Deducted stock: ${product.name} (${oldStock} → ${product.stock})`);

        } catch (error) {
            errors.push({
                productId: item.productId,
                message: error.message
            });
            console.error(`❌ Error deducting stock:`, error.message);
        }
    }

    return { stockUpdates, errors };
}

// CỘNG LẠI TỒN KHO
async function restoreProductStock(items) {
    const stockUpdates = [];
    const errors = [];

    for (const item of items) {
        try {
            const productId = item.productId?._id || item.productId;
            const product = await ProductModel.findById(productId);
            
            if (!product) {
                errors.push({
                    productId: productId,
                    productName: item.name || 'Unknown',
                    message: 'Sản phẩm không tồn tại'
                });
                continue;
            }

            const oldStock = product.stock;
            product.stock += item.quantity;
            await product.save();

            stockUpdates.push({
                productId: product._id,
                productName: product.name,
                oldStock: oldStock,
                newStock: product.stock,
                quantity: item.quantity,
                action: 'restored'
            });

            console.log(`✅ Restored stock: ${product.name} (${oldStock} → ${product.stock})`);

        } catch (error) {
            errors.push({
                productId: item.productId,
                message: error.message
            });
            console.error(`❌ Error restoring stock:`, error.message);
        }
    }

    return { stockUpdates, errors };
}

// ═══════════════════════════════════════════════════════════
// USER ORDER CONTROLLERS
// ═══════════════════════════════════════════════════════════

// CASH ON DELIVERY
export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId;
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        // VALIDATE
        const validationErrors = [];
        
        for (const item of list_items) {
            const productId = item.productId?._id || item.productId;
            const product = await ProductModel.findById(productId);
            
            if (!product) {
                validationErrors.push(`Sản phẩm "${item.productId?.name || 'Unknown'}" không tồn tại`);
                continue;
            }

            if (!product.publish) {
                validationErrors.push(`Sản phẩm "${product.name}" đã ngừng bán`);
                continue;
            }

            if (product.stock < item.quantity) {
                validationErrors.push(`Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho (bạn đang đặt ${item.quantity})`);
                continue;
            }
        }

        if (validationErrors.length > 0) {
            return response.status(400).json({
                message: 'Không thể tạo đơn hàng',
                errors: validationErrors,
                success: false,
                error: true
            });
        }

        // CHUẨN BỊ ITEMS
        const items = list_items.map(el => ({
            productId: el.productId._id || el.productId,
            name: el.productId.name,
            image: el.productId.image,
            quantity: el.quantity,
            price: el.productId.price,
            subTotal: el.productId.price * el.quantity
        }));

        // TRỪ TỒN KHO
        const { stockUpdates, errors } = await deductProductStock(items);

        if (errors.length > 0) {
            return response.status(400).json({
                message: 'Lỗi khi trừ tồn kho',
                errors: errors,
                success: false,
                error: true
            });
        }

        // TẠO ĐƠN HÀNG
        const orderPayload = {
            userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            items,
            paymentId: '',
            payment_status: 'CASH ON DELIVERY',
            delivery_address: addressId,
            subTotalAmt,
            totalAmt,
            order_status: 'pending'
        };
        
        const generatedOrder = await OrderModel.create(orderPayload);

        // XÓA CART
        await CartProductModel.deleteMany({ userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        console.log('✅ COD Order created:', generatedOrder.orderId);

        // 📊 Track metrics
        metrics.recordOrder('pending', totalAmt);
        metrics.recordCODOrder('created', totalAmt);
        metrics.recordPayment('pending', 'cod', totalAmt);

        return response.json({
            message: 'Order created successfully',
            success: true,
            data: generatedOrder,
            stockUpdates: stockUpdates
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const pricewithDiscount = (price, dis = 1) => {
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
    const actualPrice = Number(price) - Number(discountAmout);
    return actualPrice;
}

// STRIPE PAYMENT
export async function paymentController(request, response) {
    try {
        const userId = request.userId;
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        // VALIDATE
        const validationErrors = [];
        
        for (const item of list_items) {
            const productId = item.productId?._id || item.productId;
            const product = await ProductModel.findById(productId);
            
            if (!product) {
                validationErrors.push(`Sản phẩm "${item.productId?.name || 'Unknown'}" không tồn tại`);
                continue;
            }

            if (!product.publish) {
                validationErrors.push(`Sản phẩm "${product.name}" đã ngừng bán`);
                continue;
            }

            if (product.stock < item.quantity) {
                validationErrors.push(`Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`);
                continue;
            }
        }

        if (validationErrors.length > 0) {
            return response.status(400).json({
                message: 'Không thể thanh toán',
                errors: validationErrors,
                success: false,
                error: true
            });
        }

        const user = await UserModel.findById(userId);

        const line_items = list_items.map(item => {
            return {
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: item.productId.name,
                        images: item.productId.image,
                        metadata: {
                            productId: item.productId._id || item.productId
                        }
                    },
                    unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100
                },
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1
                },
                quantity: item.quantity
            }
        });

        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            metadata: {
                userId: userId,
                addressId: addressId
            },
            line_items: line_items,
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        };

        const session = await Stripe.checkout.sessions.create(params);

        return response.status(200).json(session);

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// WEBHOOK STRIPE
const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
}) => {
    const productList = [];

    if (lineItems?.data?.length) {
        for (const item of lineItems.data) {
            const product = await Stripe.products.retrieve(item.price.product);

            const payload = {
                userId: userId,
                orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                items: [{
                    productId: product.metadata.productId,
                    name: product.name,
                    image: product.images,
                    quantity: item.quantity,
                    price: item.price.unit_amount / 100,
                    subTotal: (item.price.unit_amount / 100) * item.quantity
                }],
                paymentId: paymentId,
                payment_status: payment_status,
                delivery_address: addressId,
                subTotalAmt: Number(item.amount_total / 100),
                totalAmt: Number(item.amount_total / 100),
                order_status: 'pending'
            };

            productList.push(payload);
        }
    }

    return productList;
}

export async function webhookStripe(request, response) {
    const event = request.body;

    console.log("Stripe webhook event:", event.type);

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
            const userId = session.metadata.userId;
            
            const orderProducts = await getOrderProductItems({
                lineItems: lineItems,
                userId: userId,
                addressId: session.metadata.addressId,
                paymentId: session.payment_intent,
                payment_status: session.payment_status
            });
        
            // TRỪ TỒN KHO
            for (const orderPayload of orderProducts) {
                const { stockUpdates, errors } = await deductProductStock(orderPayload.items);
                
                if (errors.length > 0) {
                    console.error('❌ Stripe webhook stock errors:', errors);
                }
                
                if (stockUpdates.length > 0) {
                    console.log('✅ Stripe stock updates:', stockUpdates);
                }
            }

            const order = await OrderModel.insertMany(orderProducts);

            console.log('✅ Stripe order created');
            
            if (Boolean(order[0])) {
                await UserModel.findByIdAndUpdate(userId, {
                    shopping_cart: []
                });
                await CartProductModel.deleteMany({ userId: userId });

                // 📊 Track metrics for each order
                for (const ord of order) {
                    metrics.recordOrder('pending', ord.totalAmt);
                    metrics.recordStripeTransaction('success', ord.totalAmt);
                    metrics.recordPayment('paid', 'stripe', ord.totalAmt);
                }
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.json({received: true});
}

// USER XEM ĐƠN HÀNG
export async function getOrderDetailsController(request, response) {
    try {
        const userId = request.userId;

        const orderlist = await OrderModel.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate('delivery_address')
            .populate('items.productId', 'name image price stock publish');

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// USER HỦY ĐƠN
export async function cancelOrderController(request, response) {
    try {
        const { orderId } = request.params;
        const userId = request.userId;

        const filter = /^[0-9a-fA-F]{24}$/.test(orderId) 
            ? { _id: orderId, userId: userId } 
            : { orderId: orderId, userId: userId };

        const order = await OrderModel.findOne(filter);

        if (!order) {
            return response.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            });
        }

        if (order.order_status !== 'pending') {
            return response.status(400).json({
                message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý',
                error: true,
                success: false
            });
        }

        // CỘNG LẠI TỒN KHO
        const { stockUpdates, errors } = await restoreProductStock(order.items);
        
        if (errors.length > 0) {
            console.error('❌ Stock restoration errors:', errors);
        }

        order.order_status = 'cancelled';
        await order.save();

        console.log('✅ User cancelled order:', order.orderId);

        return response.json({
            message: 'Đơn hàng đã được hủy và tồn kho đã được cập nhật',
            data: order,
            stockUpdates: stockUpdates,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ← THÊM NẾU CHƯA CÓ (cho admin gọi từ server này)
export async function getAllOrdersAdminController(req, res) {
    try {
        const orderlist = await OrderModel.find({})
            .sort({ createdAt: -1 })
            .populate({
                path: "userId",
                select: "name email mobile"
            })
            .populate({
                path: "delivery_address",
                select: "address_line city state country pincode mobile"
            })
            .populate({
                path: "items.productId",
                select: "name price image category subcategory stock publish"
            });

        return res.json({
            message: "All orders with client details",
            data: orderlist,
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

// ← THÊM NẾU CHƯA CÓ (cho admin cập nhật status)
export async function updateOrderStatusController(req, res) {
    try {
        const { orderId } = req.params;
        const { order_status } = req.body;

        const VALID = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
        if (!VALID.includes(order_status)) {
            return res.status(400).json({
                message: 'Invalid order_status value',
                error: true,
                success: false
            });
        }

        const filter = /^[0-9a-fA-F]{24}$/.test(orderId) ? { _id: orderId } : { orderId };

        const order = await OrderModel.findOne(filter).populate('delivery_address');
        
        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            });
        }

        if (order.order_status === order_status) {
            return res.json({
                message: 'Order status unchanged',
                data: order,
                error: false,
                success: true
            });
        }

        const allowedNext = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['shipping', 'cancelled'],
            shipping: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };

        const allowed = allowedNext[order.order_status] || [];
        if (!allowed.includes(order_status)) {
            return res.status(400).json({
                message: `Invalid transition from ${order.order_status} to ${order_status}`,
                error: true,
                success: false
            });
        }

        // CỘNG LẠI TỒN KHO KHI HỦY
        if (order_status === 'cancelled' && order.order_status !== 'cancelled') {
            console.log(`🔄 Cancelling order ${order.orderId}`);
            
            const { stockUpdates, errors } = await restoreProductStock(order.items);
            
            if (errors.length > 0) {
                console.error('❌ Stock restoration errors:', errors);
            }

            order.order_status = order_status;
            await order.save();

            return res.json({
                message: 'Order cancelled and stock restored',
                data: order,
                stockUpdates: stockUpdates,
                stockErrors: errors.length > 0 ? errors : undefined,
                error: false,
                success: true
            });
        }

        order.order_status = order_status;
        await order.save();

        return res.json({
            message: 'Order status updated',
            data: order,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
