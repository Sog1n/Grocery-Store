import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import CardProduct from '../components/CardProduct'
import CardLoading from '../components/CardLoading'
import noDataImage from '../assets/nothing here yet.webp'
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaTimes, FaFilter } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const searchText = searchParams.get('q') || ''
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSubCategories, setSelectedSubCategories] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('price_asc')
  
  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false)
  const [showPriceDropdown, setShowPriceDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  
  const allCategory = useSelector(state => state.product.allCategory)
  const allSubCategory = useSelector(state => state.product.allSubCategory)
  const reduxProducts = useSelector(state => state.product.product) // Listen to Redux products updated by SocketManager
  
  const loadingArrayCard = new Array(8).fill(null)

  const fetchData = async(pageNumber) => {
    try {
      setLoading(true)
      
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: searchText,
          page: pageNumber,
          limit: 8,
          categoryId: selectedCategories,
          subCategoryId: selectedSubCategories,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy: sortBy
        }
      })

      const { data: responseData } = response

      if(responseData.success) {
        setData(responseData.data)
        setTotalPage(responseData.totalPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchData(1)
  }, [searchText, selectedCategories, selectedSubCategories, minPrice, maxPrice, sortBy])

  // Realtime: Refetch search results when Redux products change (updated by SocketManager)
  useEffect(() => {
    if (reduxProducts.length > 0) {
      console.log('[SearchPage] Redux products changed, refetching search results...')
      fetchData(page)
    }
  }, [reduxProducts])

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if(prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleSubCategoryChange = (subCategoryId) => {
    setSelectedSubCategories(prev => {
      if(prev.includes(subCategoryId)) {
        return prev.filter(id => id !== subCategoryId)
      } else {
        return [...prev, subCategoryId]
      }
    })
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedSubCategories([])
    setMinPrice('')
    setMaxPrice('')
    setSortBy('price_asc')
  }

  const handlePageChange = (newPage) => {
    if(newPage >= 1 && newPage <= totalPage && !loading) {
      setPage(newPage)
      fetchData(newPage)
    }
  }

  const closeAllDropdowns = () => {
    setShowCategoryDropdown(false)
    setShowSubCategoryDropdown(false)
    setShowPriceDropdown(false)
    setShowSortDropdown(false)
  }

  const filteredSubCategories = selectedCategories.length > 0
    ? allSubCategory.filter(sub => 
        sub.category.some(cat => selectedCategories.includes(cat._id))
      )
    : allSubCategory

  const activeFiltersCount = selectedCategories.length + selectedSubCategories.length + 
    (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)

  const getSortLabel = () => {
    switch(sortBy) {
      case 'price_asc': return 'Giá: Thấp → Cao'
      case 'price_desc': return 'Giá: Cao → Thấp'
      case 'name': return 'Tên: A → Z'
      default: return 'Sắp xếp'
    }
  }

  const getCategoryName = (categoryId) => {
    return allCategory.find(cat => cat._id === categoryId)?.name || ''
  }

  const getSubCategoryName = (subCategoryId) => {
    return allSubCategory.find(sub => sub._id === subCategoryId)?.name || ''
  }

  return (
    <section className='bg-gradient-to-b from-gray-50 to-white min-h-screen'>
      <div className='container mx-auto px-4 py-6'>
        {/* Header with Title */}
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            {searchText ? (
              <>
                Kết quả tìm kiếm: <span className='text-primary-200'>"{searchText}"</span>
              </>
            ) : (
              'Tất cả sản phẩm'
            )}
          </h1>
          <p className='text-gray-500'>Khám phá sản phẩm phù hợp với bạn</p>
        </div>

        {/* Filter Bar */}
        <div className='bg-white rounded-2xl shadow-md p-4 mb-6'>
          <div className='flex flex-wrap items-center gap-3'>
            {/* Category Dropdown */}
            <div className='relative'>
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown)
                  setShowSubCategoryDropdown(false)
                  setShowPriceDropdown(false)
                  setShowSortDropdown(false)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${
                  selectedCategories.length > 0 
                    ? 'border-yellow-400 bg-yellow-400 font-semibold text-white shadow-lg' 
                    : 'border-gray-300 hover:border-primary-200 bg-white'
                }`}
              >
                <FaFilter size={14} className={selectedCategories.length > 0 ? 'text-white' : 'text-gray-600'} />
                <span className={selectedCategories.length > 0 ? 'text-white' : 'text-gray-700'}>Danh mục</span>
                {selectedCategories.length > 0 && (
                  <span className='bg-white text-gray-800 text-xs px-2 py-0.5 rounded-full font-bold'>
                    {selectedCategories.length}
                  </span>
                )}
                <FaChevronDown size={12} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''} ${selectedCategories.length > 0 ? 'text-white' : 'text-gray-600'}`} />
              </button>

              {showCategoryDropdown && (
                <div className='absolute top-full left-0 mt-2 w-80 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-50 max-h-96 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white'>
                    <h3 className='font-semibold text-gray-800'>Chọn danh mục</h3>
                  </div>
                  <div className='max-h-80 overflow-y-auto p-4 space-y-2'>
                    {allCategory.map(category => (
                      <label 
                        key={category._id} 
                        className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors group'
                      >
                        <input
                          type='checkbox'
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                          className='w-5 h-5 text-primary-200 rounded focus:ring-2 focus:ring-primary-200'
                        />
                        <span className='text-sm font-semibold text-gray-800 group-hover:text-primary-200'>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SubCategory Dropdown */}
            <div className='relative'>
              <button
                onClick={() => {
                  setShowSubCategoryDropdown(!showSubCategoryDropdown)
                  setShowCategoryDropdown(false)
                  setShowPriceDropdown(false)
                  setShowSortDropdown(false)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${
                  selectedSubCategories.length > 0 
                    ? 'border-yellow-400 bg-yellow-400 font-semibold text-white shadow-lg' 
                    : 'border-gray-300 hover:border-primary-200 bg-white'
                }`}
              >
                <span className={selectedSubCategories.length > 0 ? 'text-white' : 'text-gray-700'}>Danh mục con</span>
                {selectedSubCategories.length > 0 && (
                  <span className='bg-white text-gray-800 text-xs px-2 py-0.5 rounded-full font-bold'>
                    {selectedSubCategories.length}
                  </span>
                )}
                <FaChevronDown size={12} className={`transition-transform ${showSubCategoryDropdown ? 'rotate-180' : ''} ${selectedSubCategories.length > 0 ? 'text-white' : 'text-gray-600'}`} />
              </button>

              {showSubCategoryDropdown && (
                <div className='absolute top-full left-0 mt-2 w-80 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-50 max-h-96 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white'>
                    <h3 className='font-semibold text-gray-800'>Chọn danh mục con</h3>
                  </div>
                  <div className='max-h-80 overflow-y-auto p-4 space-y-2'>
                    {filteredSubCategories.map(subCategory => (
                      <label 
                        key={subCategory._id} 
                        className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors group'
                      >
                        <input
                          type='checkbox'
                          checked={selectedSubCategories.includes(subCategory._id)}
                          onChange={() => handleSubCategoryChange(subCategory._id)}
                          className='w-5 h-5 text-primary-200 rounded focus:ring-2 focus:ring-primary-200'
                        />
                        <span className='text-sm font-semibold text-gray-800 group-hover:text-primary-200'>{subCategory.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Range Dropdown */}
            <div className='relative'>
              <button
                onClick={() => {
                  setShowPriceDropdown(!showPriceDropdown)
                  setShowCategoryDropdown(false)
                  setShowSubCategoryDropdown(false)
                  setShowSortDropdown(false)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${
                  (minPrice || maxPrice)
                    ? 'border-yellow-400 bg-yellow-400 font-semibold text-white shadow-lg' 
                    : 'border-gray-300 hover:border-primary-200 bg-white'
                }`}
              >
                <span className={(minPrice || maxPrice) ? 'text-white' : 'text-gray-700'}>Khoảng giá</span>
                {(minPrice || maxPrice) && (
                  <span className='bg-white text-gray-800 text-xs px-2 py-0.5 rounded-full font-bold'>
                    ✓
                  </span>
                )}
                <FaChevronDown size={12} className={`transition-transform ${showPriceDropdown ? 'rotate-180' : ''} ${(minPrice || maxPrice) ? 'text-white' : 'text-gray-600'}`} />
              </button>

              {showPriceDropdown && (
                <div className='absolute top-full left-0 mt-2 w-96 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-50 p-5'>
                  <h3 className='font-semibold text-gray-800 mb-4'>Chọn khoảng giá</h3>
                  
                  {/* Price Inputs */}
                  <div className='flex gap-3 items-center mb-4'>
                    <div className='flex-1'>
                      <label className='block text-xs text-gray-600 mb-1'>Từ</label>
                      <input
                        type='number'
                        placeholder='0'
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className='w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-200 transition-colors'
                      />
                    </div>
                    <div className='text-gray-400 mt-6'>—</div>
                    <div className='flex-1'>
                      <label className='block text-xs text-gray-600 mb-1'>Đến</label>
                      <input
                        type='number'
                        placeholder='∞'
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className='w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-200 transition-colors'
                      />
                    </div>
                  </div>

                  {/* Quick Price Buttons */}
                  <div className='space-y-2'>
                    <p className='text-xs text-gray-600 mb-2'>Gợi ý:</p>
                    <div className='grid grid-cols-2 gap-2'>
                      {[
                        { label: 'Dưới 50k', min: '', max: '50000' },
                        { label: '50k - 100k', min: '50000', max: '100000'},
                        { label: '100k - 200k', min: '100000', max: '200000'},
                        { label: 'Trên 200k', min: '200000', max: ''}
                      ].map((range) => (
                        <button
                          key={range.label}
                          onClick={() => {
                            setMinPrice(range.min)
                            setMaxPrice(range.max)
                            setShowPriceDropdown(false)
                          }}
                          className='flex items-center gap-2 px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 hover:text-primary-200 transition-all font-medium'
                        >
                          <span>{range.icon}</span>
                          <span>{range.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className='relative ml-auto'>
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown)
                  setShowCategoryDropdown(false)
                  setShowSubCategoryDropdown(false)
                  setShowPriceDropdown(false)
                }}
                className='flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-gray-300 hover:border-primary-200 bg-white transition-all'
              >
                <span className='font-medium text-gray-700'>{getSortLabel()}</span>
                <FaChevronDown size={12} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''} text-gray-600`} />
              </button>

              {showSortDropdown && (
                <div className='absolute top-full right-0 mt-2 w-64 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden'>
                  {[
                    { label: 'Giá: Thấp → Cao', value: 'price_asc' },
                    { label: 'Giá: Cao → Thấp', value: 'price_desc'},
                    { label: 'Tên: A → Z', value: 'name' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${
                        sortBy === option.value ? 'bg-primary-50 text-primary-200 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className='flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-200'
              >
                <FaTimes />
                <span>Xóa ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className='flex flex-wrap gap-2 mb-6'>
            {selectedCategories.map(catId => (
              <div key={catId} className='flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-full text-sm font-semibold shadow-md'>
                <span>{getCategoryName(catId)}</span>
                <button onClick={() => handleCategoryChange(catId)} className='hover:bg-yellow-500 rounded-full p-1 transition-colors'>
                  <IoClose size={16} />
                </button>
              </div>
            ))}
            {selectedSubCategories.map(subCatId => (
              <div key={subCatId} className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold shadow-md'>
                <span>{getSubCategoryName(subCatId)}</span>
                <button onClick={() => handleSubCategoryChange(subCatId)} className='hover:bg-blue-600 rounded-full p-1 transition-colors'>
                  <IoClose size={16} />
                </button>
              </div>
            ))}
            {(minPrice || maxPrice) && (
              <div className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold shadow-md'>
                <span>
                  {minPrice && maxPrice ? `${Number(minPrice).toLocaleString()}đ - ${Number(maxPrice).toLocaleString()}đ` :
                   minPrice ? `Từ ${Number(minPrice).toLocaleString()}đ` :
                   `Đến ${Number(maxPrice).toLocaleString()}đ`}
                </span>
                <button onClick={() => { setMinPrice(''); setMaxPrice('') }} className='hover:bg-green-600 rounded-full p-1 transition-colors'>
                  <IoClose size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div>
          {loading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {loadingArrayCard.map((_, index) => (
                <CardLoading key={'loading' + index} />
              ))}
            </div>
          ) : data.length > 0 ? (
            <>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {data.map((product, index) => (
                  <CardProduct key={product._id + index} data={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPage > 1 && (
                <div className='flex justify-center items-center gap-2 mt-10'>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                    className='flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium'
                  >
                    <FaChevronLeft size={14} />
                    <span>Trước</span>
                  </button>

                  <div className='flex gap-2'>
                    {[...Array(totalPage)].map((_, index) => {
                      const pageNumber = index + 1
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={loading}
                          className={`w-12 h-12 rounded-xl font-semibold transition-all ${
                            page === pageNumber
                              ? 'bg-primary-200 text-white shadow-lg shadow-primary-200/50 scale-110'
                              : 'border-2 border-gray-200 hover:border-primary-200 hover:bg-primary-50'
                          } disabled:cursor-not-allowed`}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPage || loading}
                    className='flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium'
                  >
                    <span>Sau</span>
                    <FaChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col justify-center items-center py-16 bg-white rounded-2xl'>
              <img src={noDataImage} alt='No data' className='w-full max-w-sm opacity-75' />
              <p className='font-semibold text-xl text-gray-700 mt-6'>Không tìm thấy sản phẩm</p>
              <p className='text-gray-500 mt-2'>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>

      {/* Click Outside to Close Dropdowns */}
      {(showCategoryDropdown || showSubCategoryDropdown || showPriceDropdown || showSortDropdown) && (
        <div className='fixed inset-0 z-40' onClick={closeAllDropdowns} />
      )}
    </section>
  )
}

export default SearchPage
