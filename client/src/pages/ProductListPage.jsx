import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useSocket } from '../socket/useSocket'

const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)
  const params = useParams()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const [DisplaySubCategory, setDisplaySubCategory] = useState([])
  
  // Realtime: connect socket to refetch on product changes
  const userToken = useSelector(s => s.user?.accessToken)
  const socketRef = useSocket(userToken)

  const subCategory = params?.subCategory?.split("-")
  const subCategoryName = subCategory?.slice(0, subCategory?.length - 1)?.join(" ")

  const categoryId = params.category.split("-").slice(-1)[0]
  const subCategoryId = params.subCategory.split("-").slice(-1)[0]

  const fetchProductdata = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
          page: page,
          limit: 12,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        if (responseData.page === 1) {
          setData(responseData.data)
        } else {
          setData((prevData) => [...prevData, ...responseData.data])
        }
        setTotalPage(responseData.totalCount)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setData([])
  }, [params])

  useEffect(() => {
    fetchProductdata()
  }, [params, page])

  useEffect(() => {
    const sub = AllSubCategory.filter(s => {
      const filterData = s.category.some(el => {
        return el._id === categoryId
      })
      return filterData
    })
    setDisplaySubCategory(sub)
  }, [params, AllSubCategory, categoryId])

  // Realtime: refetch when product changes
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    
    const handleProductChange = () => {
      console.log('[ProductListPage] Product changed via socket, refetching...')
      // Reset to page 1 and refetch
      setPage(1)
      setData([])
      fetchProductdata()
    }
    
    socket.on('product:created', handleProductChange)
    socket.on('product:updated', handleProductChange)
    socket.on('product:deleted', handleProductChange)
    
    return () => {
      socket.off('product:created', handleProductChange)
      socket.off('product:updated', handleProductChange)
      socket.off('product:deleted', handleProductChange)
    }
  }, [socketRef.current, categoryId, subCategoryId])

  const handleLoadMore = () => {
    if (page < totalPage && !loading) {
      setPage(prevPage => prevPage + 1)
    }
  }

  return (
    <section className='bg-gray-50 min-h-screen py-4'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-4'>
          
          {/* Sidebar - Danh mục con */}
          <aside className='bg-white rounded-lg shadow-sm border border-gray-200 h-fit lg:sticky lg:top-24'>
            <div className='p-4 border-b border-gray-200'>
              <h2 className='font-bold text-lg text-gray-800'>Danh mục</h2>
            </div>
            
            <nav className='max-h-[calc(100vh-200px)] overflow-y-auto scrollbarCustom'>
              {DisplaySubCategory.map((s, index) => {
                const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`
                const isActive = subCategoryId === s._id
                
                return (
                  <Link 
                    key={s._id || index}
                    to={link} 
                    className={`
                      block px-4 py-3 border-b border-gray-100 transition-all duration-200
                      hover:bg-green-50 hover:text-green-600 hover:border-l-4 hover:border-l-green-600
                      ${isActive 
                        ? 'bg-green-50 text-green-600 border-l-4 border-l-green-600 font-semibold' 
                        : 'text-gray-700'
                      }
                    `}
                  >
                    <span className='text-sm lg:text-base'>{s.name}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Khu vực sản phẩm */}
          <main>
            {/* Header */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4'>
              <h1 className='text-xl lg:text-2xl font-bold text-gray-800'>
                {subCategoryName}
              </h1>
              <p className='text-sm text-gray-500 mt-1'>
                {data.length > 0 && `Hiển thị ${data.length} sản phẩm`}
              </p>
            </div>

            {/* Danh sách sản phẩm */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              {data.length === 0 && !loading ? (
                <div className='text-center py-12'>
                  <svg className='w-16 h-16 mx-auto text-gray-300 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                  </svg>
                  <p className='text-gray-500 text-lg'>Không có sản phẩm nào</p>
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                    {data.map((p, index) => (
                      <CardProduct
                        data={p}
                        key={p._id + "productSubCategory" + index}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {page < totalPage && (
                    <div className='text-center mt-8'>
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className='
                          bg-green-600 hover:bg-green-700 text-white font-medium 
                          px-8 py-3 rounded-lg transition-all duration-200
                          disabled:bg-gray-400 disabled:cursor-not-allowed
                          shadow-md hover:shadow-lg
                        '
                      >
                        {loading ? 'Đang tải...' : 'Xem thêm sản phẩm'}
                      </button>
                    </div>
                  )}

                  {/* Thông báo hết sản phẩm */}
                  {page >= totalPage && data.length > 0 && (
                    <div className='text-center mt-8 py-4 border-t border-gray-200'>
                      <p className='text-gray-500'>
                        ✓ Đã hiển thị tất cả sản phẩm
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Loading Overlay */}
              {loading && page === 1 && (
                <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg'>
                  <Loading />
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </section>
  )
}

export default ProductListPage
