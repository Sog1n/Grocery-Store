import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";
import { getIO } from "../socket/index.js";

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS - QUẢN LÝ TỒN KHO
// ═══════════════════════════════════════════════════════════

// ← THÊM MỚI: TRỪ TỒN KHO
async function deductProductStock(items) {
    const stockUpdates = [];
    const errors = [];

    for (const item of items) {
        try {
            // Lấy productId từ item (có thể là productId hoặc productId._id)
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

            // Trừ tồn kho
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
            console.error(`❌ Error deducting stock for ${item.productId}:`, error.message);
        }
    }

    return { stockUpdates, errors };
}

// ← ĐÃ CÓ: CỘNG LẠI TỒN KHO
async function restoreProductStock(items) {
    const stockUpdates = [];
    const errors = [];

    for (const item of items) {
        try {
            // Lấy productId từ item (có thể là productId hoặc productId._id)
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

            // Cộng lại tồn kho
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
            console.error(`❌ Error restoring stock for ${item.productId}:`, error.message);
        }
    }

    return { stockUpdates, errors };
}

// ═══════════════════════════════════════════════════════════
// ADMIN ORDER CONTROLLERS
// ═══════════════════════════════════════════════════════════

// ← CẬP NHẬT: THÊM TRỪ KHO CHO COD
export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId;
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        // BƯỚC 1: VALIDATE CART
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

        // BƯỚC 2: CHUẨN BỊ ITEMS
        const items = list_items.map(el => ({
            productId: el.productId._id || el.productId,
            name: el.productId.name,
            image: el.productId.image,
            quantity: el.quantity,
            price: el.productId.price,
            subTotal: el.productId.price * el.quantity
        }));

        // BƯỚC 3: TRỪ TỒN KHO ← THÊM MỚI
        const { stockUpdates, errors } = await deductProductStock(items);

        if (errors.length > 0) {
            return response.status(400).json({
                message: 'Lỗi khi trừ tồn kho',
                errors: errors,
                success: false,
                error: true
            });
        }

        // BƯỚC 4: TẠO ĐƠN HÀNG
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

        // BƯỚC 5: XÓA CART
        await CartProductModel.deleteMany({ userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        console.log('✅ Order created with stock deduction:', generatedOrder.orderId);

        try {
            const io = getIO()
            const eventData = { id: generatedOrder._id, orderId: generatedOrder.orderId, userId: generatedOrder.userId, status: generatedOrder.order_status }
            console.log('[Order Controller] Emitting order:created to:', {
              userRoom: `user:${generatedOrder.userId}`,
              adminRoom: 'admin:all',
              broadcast: 'user:all',
              eventData
            })
            // Emit to specific user room (if user has token and is connected)
            io.to(`user:${generatedOrder.userId}`).emit('order:created', eventData)
            // Also emit to admin room
            io.to('admin:all').emit('order:created', eventData)
            // Also emit to all users (for realtime order count, etc.)
            io.to('user:all').emit('order:created', eventData)
        } catch (e) {
            console.error('[Order Controller] Failed to emit socket event:', e)
        }

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

// ← CẬP NHẬT: THÊM VALIDATION CHO STRIPE PAYMENT
export async function paymentController(request, response) {
    try {
        const userId = request.userId;
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        // VALIDATE TRƯỚC KHI TẠO STRIPE SESSION
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

// ← CẬP NHẬT: THÊM TRỪ KHO CHO STRIPE WEBHOOK
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

    console.log("event", event);

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
        
            // ← TRỪ TỒN KHO TRƯỚC KHI TẠO ĐƠN
            for (const orderPayload of orderProducts) {
                const { stockUpdates, errors } = await deductProductStock(orderPayload.items);
                
                if (errors.length > 0) {
                    console.error('❌ Stock deduction errors:', errors);
                }
                
                if (stockUpdates.length > 0) {
                    console.log('✅ Stock updates:', stockUpdates);
                }
            }

            const order = await OrderModel.insertMany(orderProducts);

            console.log('✅ Stripe order created with stock deduction');
            
            if (Boolean(order[0])) {
                await UserModel.findByIdAndUpdate(userId, {
                    shopping_cart: []
                });
                await CartProductModel.deleteMany({ userId: userId });
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.json({received: true});
}

export async function getOrderDetailsController(request, response) {
    try {
        const userId = request.userId;

        const orderlist = await OrderModel.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate('delivery_address');

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

        // CỘNG LẠI TỒN KHO KHI HỦY ĐƠN
        if (order_status === 'cancelled' && order.order_status !== 'cancelled') {
            console.log(`🔄 Cancelling order ${order.orderId}, restoring stock...`);
            
            const { stockUpdates, errors } = await restoreProductStock(order.items);
            
            if (errors.length > 0) {
                console.error('❌ Stock restoration errors:', errors);
            }

            order.order_status = order_status;
            await order.save();

            try {
                const io = getIO()
                const eventData = { id: order._id, orderId: order.orderId, status: order.order_status }
                console.log('[Order Controller] Emitting order:cancelled to:', {
                  userRoom: `user:${order.userId}`,
                  adminRoom: 'admin:all',
                  broadcast: 'user:all'
                })
                io.to(`user:${order.userId}`).emit('order:status_changed', eventData)
                io.to('admin:all').emit('order:status_changed', eventData)
                io.to('user:all').emit('order:status_changed', eventData)
            } catch (e) {
                console.error('[Order Controller] Failed to emit socket event:', e)
            }

            return res.json({
                message: 'Order cancelled and stock restored successfully',
                data: order,
                stockUpdates: stockUpdates,
                stockErrors: errors.length > 0 ? errors : undefined,
                error: false,
                success: true
            });
        }

        order.order_status = order_status;
        await order.save();

        try {
            const io = getIO()
            const eventData = { id: order._id, orderId: order.orderId, status: order.order_status }
            console.log('[Order Controller] Emitting order:status_changed to:', {
              userRoom: `user:${order.userId}`,
              adminRoom: 'admin:all',
              broadcast: 'user:all',
              eventData
            })
            // Emit to specific user
            io.to(`user:${order.userId}`).emit('order:status_changed', eventData)
            // Emit to all admins
            io.to('admin:all').emit('order:status_changed', eventData)
            // Emit to all users (so any user viewing orders can see updates)
            io.to('user:all').emit('order:status_changed', eventData)
        } catch (e) {
            console.error('[Order Controller] Failed to emit socket event:', e)
        }

        return res.json({
            message: 'Order status updated successfully',
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

export async function cancelOrderController(req, res) {
    try {
        const { orderId } = req.params;
        const userId = req.userId;

        const filter = /^[0-9a-fA-F]{24}$/.test(orderId) 
            ? { _id: orderId } 
            : { orderId };
        filter.userId = userId;

        const order = await OrderModel.findOne(filter);

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            });
        }

        if (order.order_status !== 'pending') {
            return res.status(400).json({
                message: 'Only pending orders can be cancelled',
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

        return res.json({
            message: 'Order cancelled successfully and stock restored',
            data: order,
            stockUpdates: stockUpdates,
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

