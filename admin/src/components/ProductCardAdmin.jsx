import { useState } from 'react'
  import EditProductAdmin from './EditProductAdmin'
  import { IoClose } from 'react-icons/io5'
  import SummaryApi from '../common/SummaryApi'
  import Axios from '../utils/Axios'
  import AxiosToastError from '../utils/AxiosToastError'
  import toast from 'react-hot-toast'
  import PropTypes from 'prop-types'

  const ProductCardAdmin = ({ data, fetchProductData }) => {
    const [editOpen, setEditOpen] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

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

    return (
      <div className='bg-white p-4 rounded shadow hover:shadow-lg transition-shadow'>
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
          <p className='text-slate-400 '>{data?.price.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</p>

          <p className='text-slate-400 text-xs'>{data?.unit}</p>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <button
            onClick={() => setEditOpen(true)}
            className='flex-1 py-1.5 px-2 text-sm border border-green-600 text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors'
          >
            Edit
          </button>
          <button
            onClick={() => setOpenDelete(true)}
            className='flex-1 py-1.5 px-2 text-sm border border-red-600 text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors'
          >
            Delete
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
                <h3 className='font-semibold'>Permanent Delete</h3>
                <button onClick={() => setOpenDelete(false)}>
                  <IoClose size={25} />
                </button>
              </div>
              <p className='my-2'>Are you sure you want to permanently delete this product?</p>
              <div className='flex justify-end gap-3 py-4'>
                <button
                  onClick={handleDeleteCancel}
                  className='px-4 py-2 rounded border border-red-500 text-red-600 bg-red-50 hover:bg-red-100 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className='px-4 py-2 rounded border border-green-500 text-green-600 bg-green-50 hover:bg-green-100 transition-colors'
                >
                  Delete
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
      unit: PropTypes.string.isRequired
    }).isRequired,
    fetchProductData: PropTypes.func.isRequired
  }

  export default ProductCardAdmin