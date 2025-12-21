import { addProduct, updateProduct, removeProduct, setAllCategory, setAllSubCategory, setLoadingCategory, setProducts } from '../store/productSlice'
import { addOrder, updateOrder, setOrder } from '../store/orderSlice'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

export function registerSocketHandlers(socket, dispatch) {
  if (!socket || !dispatch) return

  // Product updates: refetch strategy (backend emits minimal payload; we refetch full list for consistency)
  let productRefetchTimer = null
  const scheduleProductRefetch = (eventName) => {
    console.log('[Socket]', eventName, '- scheduling product refetch')
    if (productRefetchTimer) clearTimeout(productRefetchTimer)
    productRefetchTimer = setTimeout(async () => {
      try {
        // Fetch first page of products (adjust limit/page as needed for your UI)
        const res = await Axios({ 
          ...SummaryApi.getProduct,
          data: { page: 1, limit: 100 }  // adjust limit based on your UI's product display
        })
        const data = res?.data?.data || []
        dispatch(setProducts(data))
        console.log('[Socket] Product list refetched:', data.length, 'products')
      } catch (e) {
        console.error('[Socket] Product refetch error:', e)
      }
    }, 300)
  }

  socket.on('product:created', () => scheduleProductRefetch('product:created'))
  socket.on('product:updated', () => scheduleProductRefetch('product:updated'))
  socket.on('product:deleted', () => scheduleProductRefetch('product:deleted'))

  // category/subcategory: refetch from API (debounced) so UI keeps canonical data
  let categoryRefetchTimer = null
  const scheduleCategoryRefetch = () => {
    if (categoryRefetchTimer) clearTimeout(categoryRefetchTimer)
    categoryRefetchTimer = setTimeout(async () => {
      try {
        dispatch(setLoadingCategory(true))
        const res = await Axios({ ...SummaryApi.getCategory })
        const data = res?.data?.data || []
        dispatch(setAllCategory(data))
      } catch (e) {
        // swallow - network errors shouldn't break socket handlers
      } finally {
        dispatch(setLoadingCategory(false))
      }
    }, 300)
  }

  socket.on('category:created', scheduleCategoryRefetch)
  socket.on('category:updated', scheduleCategoryRefetch)
  socket.on('category:deleted', scheduleCategoryRefetch)

  // subcategory refetch
  let subcategoryRefetchTimer = null
  const scheduleSubCategoryRefetch = () => {
    if (subcategoryRefetchTimer) clearTimeout(subcategoryRefetchTimer)
    subcategoryRefetchTimer = setTimeout(async () => {
      try {
        console.log('[Socket] Refetching subcategories...')
        const res = await Axios({ ...SummaryApi.getSubCategory })
        const data = res?.data?.data || []
        dispatch(setAllSubCategory(data))
      } catch (e) {}
    }, 300)
  }

  socket.on('subcategory:created', scheduleSubCategoryRefetch)
  socket.on('subcategory:updated', scheduleSubCategoryRefetch)
  socket.on('subcategory:deleted', scheduleSubCategoryRefetch)

  // order events - refetch strategy for complete data
  let orderRefetchTimer = null
  const scheduleOrderRefetch = (eventName, eventData) => {
    console.log('[Socket]', eventName, '- scheduling order refetch | Event data:', eventData)
    if (orderRefetchTimer) clearTimeout(orderRefetchTimer)
    orderRefetchTimer = setTimeout(async () => {
      try {
        const res = await Axios({ ...SummaryApi.getOrderItems })
        const data = res?.data?.data || []
        dispatch(setOrder(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
        console.log('[Socket] Order list refetched:', data.length, 'orders')
      } catch (e) {
        console.error('[Socket] Order refetch error:', e)
      }
    }, 300)
  }

  socket.on('order:created', (data) => {
    console.log('[Socket] ✅ RECEIVED order:created event:', data)
    scheduleOrderRefetch('order:created', data)
  })
  socket.on('order:status_changed', (data) => {
    console.log('[Socket] ✅ RECEIVED order:status_changed event:', data)
    scheduleOrderRefetch('order:status_changed', data)
  })
  socket.on('order:cancelled', (data) => {
    console.log('[Socket] ✅ RECEIVED order:cancelled event:', data)
    scheduleOrderRefetch('order:cancelled', data)
  })
}
