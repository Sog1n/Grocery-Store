import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { useGlobalContext } from '../provider/GlobalProvider'

const VNPayReturn = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { fetchCartItem, fetchOrder } = useGlobalContext()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        const response = await Axios({
          ...SummaryApi.vnpayReturn,
          params
        })

        if (response.data.success) {
          setStatus('success')
          if (fetchCartItem) fetchCartItem()
          if (fetchOrder) fetchOrder()

          setTimeout(() => {
            navigate('/success', {
              state: { text: 'Order' }
            })
          }, 2000)
        } else {
          setStatus('failed')
        }
      } catch (error) {
        setStatus('failed')
      }
    }

    verifyPayment()
  }, [searchParams, navigate, fetchCartItem, fetchOrder])

  return (
    <div className='container mx-auto p-4 flex items-center justify-center min-h-[50vh]'>
      {status === 'loading' && (
        <div className='text-center'>
          <p className='text-lg'>Đang xác nhận thanh toán...</p>
        </div>
      )}
      {status === 'success' && (
        <div className='text-center'>
          <p className='text-lg text-green-600'>Thanh toán thành công!</p>
        </div>
      )}
      {status === 'failed' && (
        <div className='text-center'>
          <p className='text-lg text-red-600'>Thanh toán thất bại!</p>
          <button
            onClick={() => navigate('/checkout')}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded'
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  )
}

export default VNPayReturn