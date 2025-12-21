import { addProduct, updateProduct, removeProduct, setAllCategory, setAllSubCategory, setLoadingCategory, setProducts } from '../store/productSlice'
import { addOrder, updateOrder } from '../store/orderSlice'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

export function registerSocketHandlers(socket, dispatch) {
  if (!socket || !dispatch) return

  // Product updates: refetch strategy
  let productRefetchTimer = null
  const scheduleProductRefetch = (eventName) => {
    console.log('[Admin Socket]', eventName, '- scheduling product refetch')
    if (productRefetchTimer) clearTimeout(productRefetchTimer)
    productRefetchTimer = setTimeout(async () => {
      try {
        const res = await Axios({ 
          ...SummaryApi.getProduct,
          data: { page: 1, limit: 100 }
        })
        const data = res?.data?.data || []
        dispatch(setProducts(data))
        console.log('[Admin Socket] Product list refetched:', data.length, 'products')
      } catch (e) {
        console.error('[Admin Socket] Product refetch error:', e)
      }
    }, 300)
  }

  socket.on('product:created', () => scheduleProductRefetch('product:created'))
  socket.on('product:updated', () => scheduleProductRefetch('product:updated'))
  socket.on('product:deleted', () => scheduleProductRefetch('product:deleted'))

  socket.on('order:created', (o) => {
    console.log('[Admin Socket] order:created', o)
    dispatch(addOrder(o))
  })

  socket.on('order:status_changed', (o) => {
    console.log('[Admin Socket] order:status_changed', o)
    dispatch(updateOrder({ id: o.id, changes: { order_status: o.status } }))
  })

  // category/subcategory: refetch from API (debounced)
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
      } finally {
        dispatch(setLoadingCategory(false))
      }
    }, 300)
  }

  socket.on('category:created', scheduleCategoryRefetch)
  socket.on('category:updated', scheduleCategoryRefetch)
  socket.on('category:deleted', scheduleCategoryRefetch)

  let subcategoryRefetchTimer = null
  const scheduleSubCategoryRefetch = () => {
    if (subcategoryRefetchTimer) clearTimeout(subcategoryRefetchTimer)
    subcategoryRefetchTimer = setTimeout(async () => {
      try {
        console.log('[Admin Socket] Refetching subcategories...')
        const res = await Axios({ ...SummaryApi.getSubCategory })
        const data = res?.data?.data || []
        dispatch(setAllSubCategory(data))
      } catch (e) {}
    }, 300)
  }

  socket.on('subcategory:created', scheduleSubCategoryRefetch)
  socket.on('subcategory:updated', scheduleSubCategoryRefetch)
  socket.on('subcategory:deleted', scheduleSubCategoryRefetch)
}
