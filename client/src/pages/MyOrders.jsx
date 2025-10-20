import React from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order)

  console.log("order Items",orders)
  return (
    <div>
      <div className='bg-white shadow-md p-3 font-semibold'>
        <h1>Order</h1>
      </div>
        {
          !orders[0] && (
            <NoData/>
          )
        }
        {/* {
          orders.map((order,index)=>{
            return(
              <div key={order._id+index+"order"} className='order rounded p-4 text-sm'>
                  <p>Order No : {order?.orderId}</p>
                  <div className='flex gap-3'>
                    <img
                      src={order.product_details.image[0]} 
                      className='w-14 h-14'
                    />  
                    <p className='font-medium'>{order.product_details.name}</p>
                    <p className='font-medium'>Quantity: {order.product_details.quantity}</p>
                    <p className='font-medium'>Total amount :${order.totalAmt}</p>
                  </div>
              </div>
            )
          })
        } */}
        {orders.map((order, index) => (
            <div key={order._id + index + "order"} className="order rounded p-4 text-sm border mb-4">
              <p className="font-semibold mb-2">
                Order No : {order?.orderId}
              </p>

              {/* Lặp qua từng sản phẩm trong đơn hàng */}
              <div className="flex flex-col gap-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 border-b pb-2">
                    <img
                      src={item.image?.[0]}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price}</p>
                    </div>
                    <p className="font-semibold">Subtotal: ${item.subTotal}</p>
                  </div>
                ))}
              </div>

              <div className="text-right font-semibold mt-3">
                Total Amount: ${order.totalAmt}
              </div>
            </div>
          ))}

    </div>
  )
}

export default MyOrders
