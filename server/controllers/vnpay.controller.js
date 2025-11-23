import crypto from 'crypto'
import querystring from 'qs'
import dateFormat from 'dateformat'
import vnpayConfig from '../config/vnpay.config.js'
import OrderModel from '../models/order.model.js'
import CartProductModel from '../models/cartproduct.model.js'
import UserModel from '../models/user.model.js'
import mongoose from 'mongoose'
import { metrics } from '../middleware/prometheus.middleware.js'

function sortObject(obj) {
  const sorted = {}
  const keys = Object.keys(obj).sort()
  keys.forEach(key => {
    sorted[key] = obj[key]
  })
  return sorted
}

export async function createVNPayPayment(req, res) {
  try {
    const userId = req.userId
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body

    const ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '127.0.0.1'

    const date = new Date()
    const createDate = dateFormat(date, 'yyyymmddHHMMss')
    const orderId = new mongoose.Types.ObjectId().toString().slice(-8)

    const tmnCode = vnpayConfig.vnp_TmnCode
    const secretKey = vnpayConfig.vnp_HashSecret
    let vnpUrl = vnpayConfig.vnp_Url
    const returnUrl = vnpayConfig.vnp_ReturnUrl

    // ⚠️ Fix: tạo ExpireDate đúng định dạng (không được có dấu cách)
    const expire = new Date(date.getTime() + 15 * 60 * 1000)
    const expireDate = dateFormat(expire, 'yyyymmddHHMMss')

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      // ⚠️ KHÔNG có dấu tiếng Việt hoặc dấu cách
      vnp_OrderInfo: `Thanh-toan-don-hang-${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: totalAmt * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate
    }

    vnp_Params = sortObject(vnp_Params)

    // ⚠️ CHỈ stringify với encode: false khi tạo hash
    const signData = querystring.stringify(vnp_Params, { encode: true })
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed

    // ⚠️ Khi tạo URL: cần encode chuẩn
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true })

    // Lưu order
    const items = list_items.map(el => ({
      productId: el.productId._id,
      name: el.productId.name,
      image: el.productId.image,
      quantity: el.quantity,
      price: el.productId.price,
      subTotal: el.productId.price * el.quantity
    }))

    await OrderModel.create({
      userId,
      orderId,
      items,
      paymentId: '',
      payment_status: 'PENDING',
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
      order_status: 'pending'
    })

    console.log('✅ VNPay URL:', vnpUrl)

    // 📊 Track metrics
    metrics.recordVNPayTransaction('created', totalAmt);
    metrics.recordPayment('pending', 'vnpay', totalAmt);

    return res.json({
      success: true,
      paymentUrl: vnpUrl
    })
  } catch (error) {
    console.error('VNPay error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

export async function vnpayReturn(req, res) {
  try {
    let vnp_Params = req.query
    const secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = sortObject(vnp_Params)

    const secretKey = vnpayConfig.vnp_HashSecret
    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef']
      const rspCode = vnp_Params['vnp_ResponseCode']

      const order = await OrderModel.findOne({ orderId })

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        })
      }

      if (rspCode === '00') {
        order.payment_status = 'PAID'
        order.paymentId = vnp_Params['vnp_TransactionNo']
        await order.save()

        await CartProductModel.deleteMany({ userId: order.userId })
        await UserModel.updateOne({ _id: order.userId }, { shopping_cart: [] })

        // 📊 Track metrics
        metrics.recordVNPayTransaction('success', order.totalAmt);
        metrics.recordPayment('paid', 'vnpay', order.totalAmt);

        return res.json({
          success: true,
          message: 'Payment successful',
          orderId
        })
      } else {
        order.payment_status = 'FAILED'
        order.order_status = 'cancelled'
        await order.save()

        // 📊 Track metrics
        metrics.recordVNPayTransaction('failed', order.totalAmt);
        metrics.recordPayment('failed', 'vnpay', order.totalAmt);
        metrics.recordOrder('cancelled', order.totalAmt);

        return res.json({
          success: false,
          message: 'Payment failed',
          code: rspCode
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      })
    }
  } catch (error) {
    console.error('VNPay Return Error:', error)
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}
