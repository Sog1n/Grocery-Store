import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'
import { cancelOrderController, updateOrderStatusController,CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, getAllOrdersAdminController } from '../controllers/order.controller.js'
import { createVNPayPayment, vnpayReturn } from '../controllers/vnpay.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/admin/list', auth, admin, getAllOrdersAdminController)
orderRouter.patch('/orders/:orderId/status', auth, admin, updateOrderStatusController)
orderRouter.patch('/:orderId/cancel', auth, cancelOrderController)

// VNPay routes

orderRouter.post('/vnpay/create', auth, createVNPayPayment)
orderRouter.get('/vnpay/return', vnpayReturn)


export default orderRouter