import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image,
                    quantity : el.productId.quantity
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'vnd',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// export async function getAllOrdersAdminController(request,response){
//     try {
//         // return all orders for admin view, populate user and address
//         const orderlist = await OrderModel.find({}).sort({ createdAt : -1 }).populate('delivery_address').populate('userId', '-password -shopping_cart -orderHistory')

//         return response.json({
//             message: 'all order list',
//             data: orderlist,
//             error: false,
//             success: true
//         })
//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

export async function getAllOrdersAdminController(req, res) {
  try {
    const orderlist = await OrderModel.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "name email mobile" // chỉ lấy thông tin cần thiết
      })
      .populate({
        path: "delivery_address",
        select: "address_line city state country pincode mobile"
      })
      .populate({
        path: "items.productId",
        select: "name price image category subcategory" // chỉ lấy thông tin chính của product
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

        // Support both Mongo _id and business orderId (e.g., ORD-...)
        const filter = /^[0-9a-fA-F]{24}$/.test(orderId) ? { _id: orderId } : { orderId };

        const order = await OrderModel.findOne(filter).populate('delivery_address');
        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            });
        }

        // Enforce allowed transitions:
        // PENDING -> CONFIRMED/CANCELLED
        // CONFIRMED -> SHIPPING/CANCELLED
        // SHIPPING -> DELIVERED/CANCELLED
        // DELIVERED -> none
        // CANCELLED -> none
        const allowedNext = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['shipping', 'cancelled'],
            shipping: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };

        if (order.order_status === order_status) {
            return res.json({
                message: 'Order status unchanged',
                data: order,
                error: false,
                success: true
            });
        }

        const allowed = allowedNext[order.order_status] || [];
        if (!allowed.includes(order_status)) {
            return res.status(400).json({
                message: `Invalid transition from ${order.order_status} to ${order_status}`,
                error: true,
                success: false
            });
        }

        order.order_status = order_status;
        await order.save();

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
        const userId = req.userId; // from auth middleware

        const filter = /^[0-9a-fA-F]{24}$/.test(orderId) ? { _id: orderId } : { orderId };
        filter.userId = userId; // ensure user owns this order

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

        order.order_status = 'cancelled';
        await order.save();

        return res.json({
            message: 'Order cancelled successfully',
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

