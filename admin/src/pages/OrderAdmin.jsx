import { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { FaExclamationTriangle, FaBoxOpen } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { useSocket } from '../socket/useSocket'

const OrderAdmin = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(null)
  const [recentlyUpdated, setRecentlyUpdated] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    pending: true,
    confirmed: true,
    shipping: true,
    delivered: false,
    cancelled: false
  })

  // Realtime: connect socket to update orders when user creates/cancels or admin updates
  const adminToken = useSelector(s => s.user?.accessToken)
  const socketRef = useSocket(adminToken)

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

  useEffect(() => {
    fetchOrders()
  }, [])

  // Realtime: Listen for order changes
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const handleOrderUpdate = (data) => {
      console.log('[OrderAdmin] Order updated via socket:', data)
      // Set recently updated for visual feedback
      if (data?.id) setRecentlyUpdated(data.id)
      // Refetch all orders to show latest changes
      fetchOrders()
    }

    socket.on('order:created', handleOrderUpdate)
    socket.on('order:cancelled', handleOrderUpdate)
    socket.on('order:status_changed', handleOrderUpdate)

    return () => {
      socket.off('order:created', handleOrderUpdate)
      socket.off('order:cancelled', handleOrderUpdate)
      socket.off('order:status_changed', handleOrderUpdate)
    }
  }, [socketRef.current])
  
  // Clear recently updated flag after animation
  useEffect(() => {
    if (recentlyUpdated) {
      const timer = setTimeout(() => setRecentlyUpdated(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [recentlyUpdated])

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
        return;
    }

    try {
        setUpdating(orderId);
        
        const response = await Axios({
            url: `/api/order/orders/${orderId}/status`,
            method: 'PATCH',
            data: { order_status: 'cancelled' }
        });

        if (response.data.success) {
            toast.success('Đơn hàng đã được hủy thành công');
            setRecentlyUpdated(orderId);
            fetchOrders();
        }
    } catch (error) {
        AxiosToastError(error);
    } finally {
        setUpdating(null);
    }
};

const handleStatusChange = async (orderId, newStatus) => {
    try {
        setUpdating(orderId);
        
        const response = await Axios({
            url: `/api/order/orders/${orderId}/status`,
            method: 'PATCH',
            data: { order_status: newStatus }
        });

        if (response.data.success) {
            toast.success('Cập nhật trạng thái đơn hàng thành công');
            setRecentlyUpdated(orderId);
            fetchOrders();
        }
    } catch (error) {
        AxiosToastError(error);
    } finally {
        setUpdating(null);
    }
};

  // ← THÊM: KIỂM TRA PRODUCT CÓ VẤN ĐỀ
  const hasProductIssue = (product) => {
    return !product?.publish || product?.stock <= 0
  }

  const renderOrderCard = (order, index) => {
    const progressAction = getProgressAction(order.order_status)
    const isUpdating = updating === order._id
    const isFinished = order.order_status === 'delivered' || order.order_status === 'cancelled'
    const isRecentlyUpdated = recentlyUpdated === order._id

    // ← KIỂM TRA CÓ SẢN PHẨM CÓ VẤN ĐỀ KHÔNG
    const hasIssues = order.items?.some(item => hasProductIssue(item.productId))

    return (
      <div 
        key={order._id + index} 
        className={`p-3 bg-white rounded border transition-all duration-300 ${
          isRecentlyUpdated ? 'ring-2 ring-blue-400 shadow-lg' : ''
        }`}
      >
        {/* ← THÊM WARNING BANNER */}
        {hasIssues && order.order_status !== 'cancelled' && (
          <div className='bg-orange-100 border border-orange-400 text-orange-800 px-3 py-2 rounded mb-3 text-xs'>
            <div className='flex items-center gap-2'>
              <FaExclamationTriangle />
              <strong>Đơn hàng có sản phẩm ngừng bán hoặc hết hàng!</strong>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-3">
          <div>
            <p className='text-sm font-semibold'>Order No: {order.orderId}</p>
            <p className='text-sm'>User: {order.userId?.name || order.userId?.email || 'N/A'}</p>
            <p className='text-sm'>Phone: {order.delivery_address?.mobile || 'N/A'}</p>
            <p className='text-sm'>Address: {order.delivery_address?.address_line}, {order.delivery_address?.city}, {order.delivery_address?.country}</p>
            <p className='text-sm'>Payment: {order.payment_status}</p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${getStatusBadge(order.order_status)} ${
              isRecentlyUpdated ? 'animate-pulse' : ''
            }`}>
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
                  title="Cancel order and restore stock"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <p className='font-semibold mb-2'>Items:</p>
        <div className="flex flex-col gap-2">
          {order.items?.map((item, i) => {
            const product = item.productId
            const itemHasIssue = hasProductIssue(product)

            return (
              <div 
                key={i} 
                className={`flex items-center gap-3 border-b pb-2 ${
                  itemHasIssue ? 'opacity-60 bg-red-50' : ''
                }`}
              >
                <img
                  src={item.image?.[0]}
                  alt={item.name}
                  className={`w-14 h-14 object-cover rounded ${
                    itemHasIssue ? 'grayscale' : ''
                  }`}
                />
                <div className="flex-1">
                  <p className={`font-medium ${itemHasIssue ? 'line-through' : ''}`}>
                    {item.name}
                  </p>
                  
                  {/* ← HIỂN THỊ STOCK & PUBLISH STATUS */}
                  {product && (
                    <div className='flex gap-2 mt-1'>
                      {!product.publish && (
                        <span className='text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded flex items-center gap-1'>
                          <FaExclamationTriangle size={8} />
                          Ngừng bán
                        </span>
                      )}
                      {product.stock <= 0 && (
                        <span className='text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded flex items-center gap-1'>
                          <FaBoxOpen size={8} />
                          Hết hàng
                        </span>
                      )}
                      {product.stock > 0 && (
                        <span className='text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded'>
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>
                  )}

                  <p>Quantity: {item.quantity}</p>
                  <p>Price: {item.price.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</p>
                </div>
                <p className="font-semibold">Subtotal: {item.subTotal.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</p>
              </div>
            )
          })}
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