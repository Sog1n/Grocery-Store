import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'
import { cancelOrderController, updateOrderStatusController,CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, getAllOrdersAdminController } from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/admin/list', auth, admin, getAllOrdersAdminController)
orderRouter.patch('/orders/:orderId/status', auth, admin, updateOrderStatusController);
orderRouter.patch('/:orderId/cancel', auth, cancelOrderController)
export default orderRouter