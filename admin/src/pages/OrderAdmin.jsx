import { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'

const OrderAdmin = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    pending: true,
    confirmed: true,
    shipping: true,
    delivered: false,
    cancelled: false
  })

  const toggleSection = (status) => {
    setExpandedSections(prev => ({
      ...prev,
      [status]: !prev[status]
    }))
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipping: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getProgressAction = (currentStatus) => {
    const actions = {
      pending: { next: 'confirmed', text: 'Confirm Order' },
      confirmed: { next: 'shipping', text: 'Ship Order' },
      shipping: { next: 'delivered', text: 'Mark Delivered' },
      delivered: null,
      cancelled: null
    }
    return actions[currentStatus]
  }

  const groupOrdersByStatus = (orders) => {
    const grouped = {
      pending: [],
      confirmed: [],
      shipping: [],
      delivered: [],
      cancelled: []
    }

    orders.forEach(order => {
      const status = order.order_status
      if (grouped[status]) {
        grouped[status].push(order)
      }
    })

    return grouped
  }

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(orderId)
      const response = await Axios({
        ...SummaryApi.updateOrderStatus,
        url: SummaryApi.updateOrderStatus.url.replace(':orderId', orderId),
        data: { order_status: newStatus }
      })

      if (response.data.success) {
        toast.success('Order status updated successfully')
        fetchOrders()
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setUpdating(null)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      setUpdating(orderId)
      const response = await Axios({
        ...SummaryApi.updateOrderStatus,
        url: SummaryApi.updateOrderStatus.url.replace(':orderId', orderId),
        data: { order_status: 'cancelled' }
      })

      if (response.data.success) {
        toast.success('Order cancelled successfully')
        fetchOrders()
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const renderOrderCard = (order, index) => {
    const progressAction = getProgressAction(order.order_status)
    const isUpdating = updating === order._id
    const isFinished = order.order_status === 'delivered' || order.order_status === 'cancelled'

    return (
      <div key={order._id + index} className='p-3 bg-white rounded border'>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className='text-sm font-semibold'>Order No: {order.orderId}</p>
            <p className='text-sm'>User: {order.userId?.name || order.userId?.email || 'N/A'}</p>
            <p className='text-sm'>Phone: {order.delivery_address?.mobile || 'N/A'}</p>
            <p className='text-sm'>Address: {order.delivery_address?.address_line}, {order.delivery_address?.city}, {order.delivery_address?.country}</p>
            <p className='text-sm'>Payment: {order.payment_status}</p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.order_status)}`}>
              {order.order_status}
            </span>

            {!isFinished && (
              <div className="flex gap-2">
                {progressAction && (
                  <button
                    onClick={() => handleStatusChange(order._id, progressAction.next)}
                    disabled={isUpdating}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isUpdating ? 'Updating...' : progressAction.text}
                  </button>
                )}

                <button
                  onClick={() => handleCancelOrder(order._id)}
                  disabled={isUpdating}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <p className='font-semibold mb-2'>Items:</p>
        <div className="flex flex-col gap-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 border-b pb-2">
              <img
                src={item.image?.[0]}
                alt={item.name}
                className="w-14 h-14 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: {item.price.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</p>
              </div>
              <p className="font-semibold">Subtotal: {item.subTotal.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</p>
            </div>
          ))}
        </div>

        <div className="text-right font-semibold mt-3">
          Total Amount: {order.totalAmt.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}
        </div>
      </div>
    )
  }

  const renderSection = (status, title, colorClass, orders) => {
    return (
        <div className="mb-6 border rounded-lg overflow-hidden">
          <button
              onClick={() => toggleSection(status)}
              className={`w-full flex items-center justify-between p-4 ${colorClass} hover:opacity-80 transition-opacity`}
          >
            <h3 className="text-lg font-semibold">
              {title} ({orders.length})
            </h3>
            {expandedSections[status] ? (
                <IoIosArrowUp className="text-xl" />
            ) : (
                <IoIosArrowDown className="text-xl" />
            )}
          </button>

          {expandedSections[status] && (
              <div className='p-4 bg-gray-50'>
                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No orders in this status</p>
                ) : (
                    <div className='grid gap-3'>
                      {orders.map((order, index) => renderOrderCard(order, index))}
                    </div>
                )}
              </div>
          )}
        </div>
    )
  }
  const groupedOrders = groupOrdersByStatus(orders)

  return (
    <section>
      <div className='p-2 bg-white shadow-md'>
        <h2 className='font-semibold'>All Orders (Admin)</h2>
      </div>

      {loading ? <Loading /> : (
        <div className='p-4'>
          {!orders?.length && <p>No orders yet</p>}

          {renderSection('pending', 'Pending Orders', 'bg-yellow-100 text-yellow-800', groupedOrders.pending)}
          {renderSection('confirmed', 'Confirmed Orders', 'bg-blue-100 text-blue-800', groupedOrders.confirmed)}
          {renderSection('shipping', 'Shipping Orders', 'bg-purple-100 text-purple-800', groupedOrders.shipping)}
          {renderSection('delivered', 'Delivered Orders', 'bg-green-100 text-green-800', groupedOrders.delivered)}
          {renderSection('cancelled', 'Cancelled Orders', 'bg-red-100 text-red-800', groupedOrders.cancelled)}
        </div>
      )}
    </section>
  )
}

export default OrderAdmin