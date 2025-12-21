import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory } from './store/productSlice';
import { setOrder } from './store/orderSlice';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import { handleAddItemCart } from './store/cartProduct'
import GlobalProvider from './provider/GlobalProvider';
import { FaCartShopping } from "react-icons/fa6";
import CartMobileLink from './components/CartMobile';
import SocketManager from './socket/SocketManager';

function App() {
  const dispatch = useDispatch()
  const location = useLocation()


  const adminPaths = ["/admin"]
  const RemoveButtonMyCart = ["/dashboard/profile", "/dashboard/my-orders", "/dashboard/address", "/dashboard/category", "/dashboard/sub-category", "/dashboard/upload-product", "/dashboard/product-admin"]

  const hideLayout = adminPaths.includes(location.pathname)
  const hideButton = RemoveButtonMyCart.includes(location.pathname)

  const fetchUser = async () => {
    const userData = await fetchUserDetails()
    dispatch(setUserDetails(userData.data))
  }

  const fetchCategory = async () => {
    try {
      dispatch(setLoadingCategory(true))
      const response = await Axios({
        ...SummaryApi.getCategory
      })

      const { data: responseData } = response

      if (responseData.success) {
        dispatch(setAllCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name))))

      }

    } catch (error) {

    } finally {
      dispatch(setLoadingCategory(false))
    }

  }

  const fetchSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory
      })
      const { data: responseData } = response

      if (responseData.success) {
        dispatch(setAllSubCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name))))
      }
    } catch (error) {

    } finally {
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getOrderItems
      })
      const { data: responseData } = response

      if (responseData.success) {
        dispatch(setOrder(responseData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      }
    } catch (error) {
      // User might not be logged in, that's ok
    }
  }

  useEffect(() => {
    fetchUser()
    fetchCategory()
    fetchSubCategory()
    fetchOrders()
    // fetchCartItem()
  }, [])

  return (
    <GlobalProvider>
      <SocketManager />
      {!hideLayout && <Header />}
      <main className='min-h-[78vh]'>
        <Outlet />
      </main>
      {!hideLayout && <Footer />}
      <Toaster />
      {!hideButton && location.pathname !== '/checkout' && (
        <CartMobileLink />
      )}
    </GlobalProvider>
  )
}

export default App