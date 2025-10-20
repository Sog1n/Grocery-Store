import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'

const OrderAdmin = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.adminGetAllOrders
      })
      const { data: responseData } = response

      if (responseData.success) {
        setOrders(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <section>
      <div className='p-2 bg-white shadow-md'>
        <h2 className='font-semibold'>All Orders (Admin)</h2>
      </div>

      {loading ? <Loading /> : (
        <div className='p-4'>
          {!orders?.length && <p>No orders yet</p>}

          <div className='grid gap-3'>
            {orders.map((order, index) => {
              return (
                <div key={order._id + index} className='p-3 bg-white rounded border'>
                  <p className='text-sm'>Order No: {order.orderId}</p>
                  <p className='text-sm'>User: {order.userId?.name || order.userId?.email || 'N/A'}</p>
                  <p className='text-sm'>Address: {order.delivery_address?.address_line  }, {order.delivery_address?.city  }, {order.delivery_address?.country  }</p>
                  <p className='text-sm mb-2'>Payment Status: {order.payment_status}</p> 
                  <p className='font-semibold mb-2'>Items:</p>
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
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default OrderAdmin
