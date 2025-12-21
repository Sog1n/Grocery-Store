import { useState, useEffect } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import NoData from "../components/NoData.jsx"
import { useSelector } from "react-redux"
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'

const MyOrders = () => {
    const orders = useSelector(state => state.orders.order)
    const [loading, setLoading] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [recentlyUpdated, setRecentlyUpdated] = useState(null)
    const [expandedSections, setExpandedSections] = useState({
        pending: true,
        confirmed: true,
        shipping: true,
        delivered: false,
        cancelled: false
    })

    // SocketManager đã xử lý order events và update Redux orders
    // Component này chỉ cần đọc từ Redux store
    
    // Visual feedback when orders change via socket
    useEffect(() => {
        if (orders.length > 0) {
            // Flash animation for recently updated orders
            const timer = setTimeout(() => setRecentlyUpdated(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [orders])

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

    const getStatusText = (status) => {
        const texts = {
            pending: 'PENDING',
            confirmed: 'CONFIRMED',
            shipping: 'SHIPPING',
            delivered: 'DELIVERED',
            cancelled: 'CANCELLED'
        }
        return texts[status] || status
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

    const openCancelDialog = (orderId) => {
        setSelectedOrderId(orderId)
        setShowConfirmDialog(true)
    }

    const closeCancelDialog = () => {
        setShowConfirmDialog(false)
        setSelectedOrderId(null)
    }

    const handleCancelOrder = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.cancelOrder,
                url: SummaryApi.cancelOrder.url.replace(':orderId', selectedOrderId)
            })

            if (response.data.success) {
                toast.success('CANCELLED')
                setRecentlyUpdated(selectedOrderId)
                closeCancelDialog()
                // No need to reload - SocketManager will update Redux
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const renderOrderCard = (order, index) => {
        const isRecentlyUpdated = recentlyUpdated === order._id
        
        return (
            <div 
                key={order._id + index + "order"} 
                className={`order rounded p-4 text-sm border mb-4 bg-white shadow transition-all duration-300 ${
                    isRecentlyUpdated ? 'ring-2 ring-blue-400 animate-pulse' : ''
                }`}
            >
                <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold">Order No : {order?.orderId}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.order_status)} transition-colors duration-300`}>
                        {getStatusText(order.order_status)}
                    </span>
                </div>

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
                                <p>Price: {item.price.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</p>
                            </div>
                            <p className="font-semibold">Subtotal: {item.subTotal.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-3">
                    <div className="text-right font-semibold">
                        Total Amount: {order.totalAmt.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}
                    </div>
                    {order.order_status === 'pending' && (
                        <button
                            onClick={() => openCancelDialog(order._id)}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Cancel Order
                        </button>
                    )}
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
        <div>
            <div className='bg-white shadow-md p-3 font-semibold'>
                <h1>My Orders</h1>
            </div>

            <div className='p-4'>
                {!orders?.length && <NoData/>}

                {orders?.length > 0 && (
                    <>
                        {renderSection('pending', 'Pending Orders', 'bg-yellow-100 text-yellow-800', groupedOrders.pending)}
                        {renderSection('confirmed', 'Confirmed Orders', 'bg-blue-100 text-blue-800', groupedOrders.confirmed)}
                        {renderSection('shipping', 'Shipping Orders', 'bg-purple-100 text-purple-800', groupedOrders.shipping)}
                        {renderSection('delivered', 'Delivered Orders', 'bg-green-100 text-green-800', groupedOrders.delivered)}
                        {renderSection('cancelled', 'Cancelled Orders', 'bg-red-100 text-red-800', groupedOrders.cancelled)}
                    </>
                )}
            </div>

            {/* Confirm Cancel Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Confirm Cancel Order</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeCancelDialog}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                                No, Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={loading}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                            >
                                {loading ? 'Cancelling...' : 'Yes, Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyOrders