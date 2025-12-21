import React, { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import DisplayPriceInVND from '../utils/DisplayPriceInRupees'
import { FaCaretRight, FaExclamationTriangle } from "react-icons/fa"
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty_cart.webp'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const DisplayCartItem = ({close}) => {
    const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    const [cartValidation, setCartValidation] = useState({
        canCheckout: true,
        discontinuedItems: 0,
        outOfStockItems: 0,
        issues: []
    })
    const [validating, setValidating] = useState(false)

    const validateCart = async () => {
        try {
            setValidating(true)
            const response = await Axios({
                ...SummaryApi.validateCartCheckout
            })

            if(response.data.success) {
                setCartValidation({
                    canCheckout: response.data.canCheckout,
                    discontinuedItems: response.data.issues?.filter(i => i.type === 'discontinued').length || 0,
                    outOfStockItems: response.data.issues?.filter(i => i.type === 'out_of_stock' || i.type === 'insufficient_stock').length || 0,
                    issues: response.data.issues || []
                })
            }
        } catch (error) {
            console.error('Validate cart error:', error)
            setCartValidation({
                canCheckout: true,
                discontinuedItems: 0,
                outOfStockItems: 0,
                issues: []
            })
        } finally {
            setValidating(false)
        }
    }

    useEffect(() => {
        if(cartItem.length > 0 && user?._id) {
            validateCart()
        }
    }, [cartItem, user])

    const hasIssue = (item) => {
        const product = item?.productId
        if(!product) return false
        return !product.publish || product.stock <= 0
    }

    const calculateValidTotal = () => {
        return cartItem.reduce((sum, item) => {
            if(hasIssue(item)) return sum
            const price = pricewithDiscount(item?.productId?.price, item?.productId?.discount)
            return sum + (price * item?.quantity)
        }, 0)
    }

    const validTotalPrice = calculateValidTotal()

    const redirectToCheckoutPage = async () => {
        if(!user?._id) {
            toast("Please Login")
            return
        }

        if(!cartValidation.canCheckout) {
            toast.error('Vui lòng xóa các sản phẩm không thể mua trước khi thanh toán', {
                duration: 4000
            })
            
            if(cartValidation.issues.length > 0) {
                cartValidation.issues.slice(0, 3).forEach(issue => {
                    toast.error(issue.message, { duration: 5000 })
                })
                
                if(cartValidation.issues.length > 3) {
                    toast.error(`Và ${cartValidation.issues.length - 3} sản phẩm khác...`, { duration: 4000 })
                }
            }
            
            return
        }

        try {
            const validateResponse = await Axios({
                ...SummaryApi.validateCartCheckout
            })

            if(!validateResponse.data.canCheckout) {
                toast.error('Giỏ hàng có vấn đề. Vui lòng kiểm tra lại.')
                validateCart()
                return
            }
        } catch (error) {
            console.error('Final validation error:', error)
        }

        navigate("/checkout")
        if(close) {
            close()
        }
    }

    return (
        <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50'>
            <div className='bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto'>
                <div className='flex items-center p-4 shadow-md gap-3 justify-between'>
                    <h2 className='font-semibold'>Cart</h2>
                    <Link to={"/"} className='lg:hidden'>
                        <IoClose size={25}/>
                    </Link>
                    <button onClick={close} className='hidden lg:block'>
                        <IoClose size={25}/>
                    </button>
                </div>

                <div className='min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-blue-50 p-2 flex flex-col gap-4'>
                    {/***display items */}
                    {
                        cartItem[0] ? (
                            <>
                                {/* ← THÊM WARNING BANNER */}
                                {!cartValidation.canCheckout && cartItem.length > 0 && (
                                    <div className='bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded-lg text-xs'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <FaExclamationTriangle size={14} />
                                            <strong>Không thể thanh toán</strong>
                                        </div>
                                        <p>
                                            {cartValidation.discontinuedItems > 0 && `${cartValidation.discontinuedItems} sản phẩm ngừng bán`}
                                            {cartValidation.discontinuedItems > 0 && cartValidation.outOfStockItems > 0 && ', '}
                                            {cartValidation.outOfStockItems > 0 && `${cartValidation.outOfStockItems} sản phẩm hết hàng/không đủ số lượng`}.
                                            Vui lòng xóa để tiếp tục.
                                        </p>
                                    </div>
                                )}

                                <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full'>
                                    <p>Your total savings</p>
                                    <p>{DisplayPriceInVND(notDiscountTotalPrice - validTotalPrice)}</p>
                                </div>

                                <div className='bg-white rounded-lg p-4 grid gap-5 overflow-auto'>
                                    {
                                        cartItem[0] && (
                                            cartItem.map((item, index) => {
                                                const itemHasIssue = hasIssue(item)
                                                const product = item?.productId

                                                return (
                                                    <div 
                                                        key={item?._id + "cartItemDisplay"} 
                                                        className={`flex w-full gap-4 relative ${
                                                            itemHasIssue ? 'opacity-60' : ''
                                                        }`}
                                                    >
                                                        <div className='w-16 h-16 min-h-16 min-w-16 border rounded overflow-hidden'>
                                                            <img
                                                                src={product?.image[0]}
                                                                className={`object-scale-down w-full h-full ${
                                                                    itemHasIssue ? 'grayscale' : ''
                                                                }`}
                                                                alt={product?.name}
                                                            />
                                                        </div>

                                                        <div className='w-full max-w-sm text-xs flex-grow'>
                                                            <p className={`text-xs text-ellipsis line-clamp-2 ${
                                                                itemHasIssue ? 'line-through text-gray-500' : ''
                                                            }`}>
                                                                {product?.name}
                                                            </p>
                                                            <p className='text-neutral-400'>{product?.unit}</p>

                                                            {/* ← HIỂN THỊ WARNING MESSAGE */}
                                                            {!product?.publish && (
                                                                <div className='bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded mt-1 flex items-center gap-1 w-fit'>
                                                                    <FaExclamationTriangle size={8} />
                                                                    <span>Đã ngừng bán</span>
                                                                </div>
                                                            )}
                                                            {product?.stock <= 0 && (
                                                                <div className='bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded mt-1 flex items-center gap-1 w-fit'>
                                                                    <FaExclamationTriangle size={8} />
                                                                    <span>Đã hết hàng</span>
                                                                </div>
                                                            )}
                                                            {product?.stock > 0 && product?.stock < item?.quantity && (
                                                                <div className='bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded mt-1 flex items-center gap-1 w-fit'>
                                                                    <FaExclamationTriangle size={8} />
                                                                    <span>Chỉ còn {product?.stock} sản phẩm</span>
                                                                </div>
                                                            )}

                                                            <p className={`font-semibold ${
                                                                itemHasIssue ? 'line-through text-gray-400' : ''
                                                            }`}>
                                                                {DisplayPriceInVND(pricewithDiscount(product?.price, product?.discount))}
                                                            </p>
                                                        </div>

                                                        {/* ← DI CHUYỂN BADGE VỀ GÓC PHẢI DƯỚI */}
                                                        <div className='flex flex-col items-end justify-between'>
                                                            <AddToCartButton data={product}/>
                                                            
                                                            {/* ← BADGE WARNING GÓC PHẢI DƯỚI */}
                                                            {itemHasIssue && (
                                                                <div className='bg-red-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-md mt-2'>
                                                                    <FaExclamationTriangle size={20} />
                                                                    <span className='font-semibold'>Không thể mua</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )
                                    }
                                </div>

                                <div className='bg-white p-4'>
                                    <h3 className='font-semibold'>Bill details</h3>
                                    <div className='flex gap-4 justify-between ml-1'>
                                        <p>Items total</p>
                                        <p className='flex items-center gap-2'>
                                            <span className='line-through text-neutral-400'>
                                                {DisplayPriceInVND(notDiscountTotalPrice)}
                                            </span>
                                            <span>{DisplayPriceInVND(validTotalPrice)}</span>
                                        </p>
                                    </div>
                                    <div className='flex gap-4 justify-between ml-1'>
                                        <p>Quantity total</p>
                                        <p className='flex items-center gap-2'>{totalQty} item</p>
                                    </div>
                                    <div className='flex gap-4 justify-between ml-1'>
                                        <p>Delivery Charge</p>
                                        <p className='flex items-center gap-2'>Free</p>
                                    </div>
                                    <div className='font-semibold flex items-center justify-between gap-4'>
                                        <p>Grand total</p>
                                        <p>{DisplayPriceInVND(validTotalPrice)}</p>
                                    </div>

                                    {/* ← NOTE NẾU CÓ SẢN PHẨM BỊ LOẠI */}
                                    {!cartValidation.canCheckout && (
                                        <p className='text-xs text-red-600 mt-2'>
                                            * Sản phẩm không thể mua sẽ không được tính vào tổng
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className='bg-white flex flex-col justify-center items-center'>
                                <img
                                    src={imageEmpty}
                                    className='w-full h-full object-scale-down' 
                                    alt='Empty cart'
                                />
                                <Link onClick={close} to={"/"} className='block bg-green-600 px-4 py-2 text-white rounded'>
                                    Shop Now
                                </Link>
                            </div>
                        )
                    }
                </div>

                {
                    cartItem[0] && (
                        <div className='p-2'>
                            <div className={`text-neutral-100 px-4 font-bold text-base py-4 static bottom-3 rounded flex items-center gap-4 justify-between transition-colors ${
                                cartValidation.canCheckout 
                                    ? 'bg-green-700 cursor-pointer hover:bg-green-800' 
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}>
                                <div>
                                    {DisplayPriceInVND(validTotalPrice)}
                                </div>
                                <button 
                                    onClick={redirectToCheckoutPage} 
                                    disabled={!cartValidation.canCheckout || validating}
                                    className='flex items-center gap-1 disabled:opacity-70'
                                    title={!cartValidation.canCheckout ? 'Xóa sản phẩm không thể mua để tiếp tục thanh toán' : ''}
                                >
                                    {!cartValidation.canCheckout ? (
                                        <>
                                            <FaExclamationTriangle />
                                            <span>Không thể thanh toán</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Proceed</span>
                                            <FaCaretRight/>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* ← MESSAGE BÊN DƯỚI NÚT */}
                            {!cartValidation.canCheckout && (
                                <p className='text-xs text-red-600 text-center mt-2 animate-pulse'>
                                    ⚠️ Xóa sản phẩm không thể mua để thanh toán
                                </p>
                            )}
                        </div>
                    )
                }
            </div>
        </section>
    )
}

export default DisplayCartItem
