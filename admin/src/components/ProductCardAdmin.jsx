import { useState } from 'react'
import EditProductAdmin from './EditProductAdmin'
import { IoClose } from 'react-icons/io5'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'

const ProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen, setEditOpen] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDeleteCancel = () => {
    setOpenDelete(false)
  }

  const handleDelete = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: {
          _id: data._id
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        if (fetchProductData) {
          fetchProductData()
        }
        setOpenDelete(false)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  // ← THÊM FUNCTION TOGGLE PUBLISH
  const handleTogglePublish = async () => {
    try {
      setLoading(true)
      
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: {
          _id: data._id,
          publish: !data.publish  // Toggle true/false
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(data.publish ? 'Đã ngừng bán sản phẩm' : 'Đã bật bán sản phẩm')
        if (fetchProductData) {
          fetchProductData()
        }
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-white p-4 rounded shadow hover:shadow-lg transition-shadow relative'>
      {/* ← BADGE TRẠNG THÁI - Góc trên bên phải */}
      <div className='absolute top-2 right-2 z-10'>
        {data.publish ? (
          <div className='flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md'>
            <FaCheckCircle size={10} />
            <span className='font-semibold'>Đang bán</span>
          </div>
        ) : (
          <div className='flex items-center gap-1 bg-gray-500 text-white text-xs px-2 py-1 rounded-full shadow-md'>
            <FaTimesCircle size={10} />
            <span className='font-semibold'>Ngừng bán</span>
          </div>
        )}
      </div>

      {/* Product Image */}
      <div className='w-full h-32 flex items-center justify-center mb-3'>
        <img
          src={data?.image[0]}
          alt={data?.name}
          className='w-full h-full object-contain'
        />
      </div>

      {/* Product Info */}
      <div className='space-y-1 mb-3'>
        <p className='text-ellipsis line-clamp-2 font-medium text-sm min-h-[2.5rem]'>
          {data?.name}
        </p>
        <p className='text-slate-400'>
          {data?.price.toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}
        </p>
        <p className='text-slate-400 text-xs'>{data?.unit}</p>
        
        {/* ← THÔNG TIN TỒN KHO */}
        <div className='flex items-center justify-between text-xs bg-blue-50 px-2 py-1.5 rounded mt-2'>
          <div className='flex items-center gap-1'>
            <span className='text-gray-600'>Tồn kho:</span>
            <strong className={data.stock <= 10 ? 'text-red-600' : 'text-green-600'}>
              {data.stock}
            </strong>
          </div>
          {data.stock <= 10 && data.stock > 0 && (
            <span className='text-orange-600 font-medium'>Sắp hết</span>
          )}
          {data.stock === 0 && (
            <span className='text-red-600 font-medium'>Hết hàng</span>
          )}
        </div>
      </div>

      {/* ← ACTION BUTTONS - CẬP NHẬT LAYOUT */}
      <div className='grid grid-cols-3 gap-2'>
        {/* Button Edit */}
        <button
          onClick={() => setEditOpen(true)}
          disabled={loading}
          className='py-1.5 px-2 text-xs border border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 font-medium'
        >
          Sửa
        </button>

        {/* ← BUTTON TOGGLE PUBLISH */}
        <button
          onClick={handleTogglePublish}
          disabled={loading}
          className={`py-1.5 px-2 text-xs border rounded transition-colors disabled:opacity-50 font-medium ${
            data.publish 
              ? 'border-orange-600 text-orange-700 bg-orange-50 hover:bg-orange-100' 
              : 'border-green-600 text-green-700 bg-green-50 hover:bg-green-100'
          }`}
        >
          {data.publish ? 'Tắt' : 'Bật'}
        </button>

        {/* Button Delete */}
        <button
          onClick={() => setOpenDelete(true)}
          disabled={loading}
          className='py-1.5 px-2 text-xs border border-red-600 text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-50 font-medium'
        >
          Xóa
        </button>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <EditProductAdmin
          fetchProductData={fetchProductData}
          data={data}
          close={() => setEditOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {openDelete && (
        <section className='fixed top-0 left-0 right-0 bottom-0 bg-neutral-600 z-50 bg-opacity-70 p-4 flex justify-center items-center'>
          <div className='bg-white p-4 w-full max-w-md rounded-md'>
            <div className='flex items-center justify-between gap-4'>
              <h3 className='font-semibold'>Xóa vĩnh viễn</h3>
              <button onClick={() => setOpenDelete(false)}>
                <IoClose size={25} />
              </button>
            </div>
            <p className='my-2'>Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?</p>
            <div className='flex justify-end gap-3 py-4'>
              <button
                onClick={handleDeleteCancel}
                className='px-4 py-2 rounded border border-red-500 text-red-600 bg-red-50 hover:bg-red-100 transition-colors'
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className='px-4 py-2 rounded border border-green-500 text-green-600 bg-green-50 hover:bg-green-100 transition-colors'
              >
                Xóa
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

ProductCardAdmin.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.arrayOf(PropTypes.string).isRequired,
    unit: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    publish: PropTypes.bool.isRequired
  }).isRequired,
  fetchProductData: PropTypes.func.isRequired
}

export default ProductCardAdmin