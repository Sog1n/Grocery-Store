import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'

const OrderAdmin = () => {
  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(false)

  const fetchOrders = async()=>{
    try{
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.adminGetAllOrders
      })
      const { data : responseData } = response

      if(responseData.success){
        setOrders(responseData.data)
      }
    }catch(error){
      AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchOrders()
  },[])

  return (
    <section>
      <div className='p-2 bg-white shadow-md'>
        <h2 className='font-semibold'>All Orders (Admin)</h2>
      </div>

      {loading ? <Loading/> : (
        <div className='p-4'>
          {!orders?.length && <p>No orders yet</p>}

          <div className='grid gap-3'>
            {orders.map((order,index)=>{
              return (
                <div key={order._id+index} className='p-3 bg-white rounded border'>
                  <p className='text-sm'>Order No: {order.orderId}</p>
                  <p className='text-sm'>User: {order.userId?.name || order.userId?.email || 'N/A'}</p>
                  <p className='text-sm'>Product: {order.product_details?.name}</p>
                  <p className='text-sm'>Qty: 1</p>
                  <p className='text-sm'>Total: {order.totalAmt}</p>
                  <p className='text-sm'>Payment status: {order.payment_status}</p>
                  <p className='text-sm'>Address id: {order.delivery_address?._id || order.delivery_address}</p>
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
