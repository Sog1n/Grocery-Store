import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import { metrics } from "../middleware/prometheus.middleware.js";

export const addToCartItemController = async(request,response)=>{
    try {
        const userId = request.userId
        const { productId } = request.body
        
        if(!productId){
            return response.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        // Kiểm tra sản phẩm có đang bán không
        const product = await ProductModel.findById(productId)
        
        if(!product) {
            return response.status(404).json({
                message : "Product not found",
                error : true,
                success : false
            })
        }

        if(!product.publish) {
            return response.status(400).json({
                message : "Sản phẩm này đã ngừng bán",
                error : true,
                success : false
            })
        }

        if(product.stock <= 0) {
            return response.status(400).json({
                message : "Sản phẩm này đã hết hàng",
                error : true,
                success : false
            })
        }

        const checkItemCart = await CartProductModel.findOne({
            userId : userId,
            productId : productId
        })

        if(checkItemCart){
            return response.status(400).json({
                message : "Item already in cart"
            })
        }

        const cartItem = new CartProductModel({
            quantity : 1,
            userId : userId,
            productId : productId
        })
        const save = await cartItem.save()

        const updateCartUser = await UserModel.updateOne({ _id : userId},{
            $push : { 
                shopping_cart : productId
            }
        })

        // 📊 Track metrics
        metrics.recordCartAction('added');

        return response.json({
            data : save,
            message : "Item add successfully",
            error : false,
            success : true
        })

        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// CẬP NHẬT: Thêm thông tin về sản phẩm ngừng bán
export const getCartItemController = async(request,response)=>{
    try {
        const userId = request.userId

        const cartItem = await CartProductModel.find({
            userId : userId
        }).populate('productId')

        // Gắn flag cho sản phẩm có vấn đề
        const cartItemsWithStatus = cartItem.map(item => {
            const product = item.productId
            if(!product) {
                return {
                    ...item.toObject(),
                    isDiscontinued: true,
                    isOutOfStock: true,
                    hasIssue: true
                }
            }
            return {
                ...item.toObject(),
                isDiscontinued: !product.publish,
                isOutOfStock: product.stock <= 0,
                hasIssue: !product.publish || product.stock <= 0
            }
        })

        // Đếm số sản phẩm có vấn đề
        const discontinuedCount = cartItemsWithStatus.filter(item => item.isDiscontinued).length
        const outOfStockCount = cartItemsWithStatus.filter(item => item.isOutOfStock).length
        const canCheckout = cartItemsWithStatus.every(item => !item.hasIssue)

        return response.json({
            data : cartItemsWithStatus,
            summary: {
                totalItems: cartItemsWithStatus.length,
                discontinuedItems: discontinuedCount,
                outOfStockItems: outOfStockCount,
                canCheckout: canCheckout
            },
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// CẬP NHẬT: Kiểm tra sản phẩm trước khi update
export const updateCartItemQtyController = async(request,response)=>{
    try {
        const userId = request.userId 
        const { _id, qty } = request.body

        if(!_id || !qty){
            return response.status(400).json({
                message : "provide _id, qty"
            })
        }

        // Lấy thông tin cart item
        const cartItem = await CartProductModel.findOne({
            _id : _id,
            userId : userId
        }).populate('productId')

        if(!cartItem) {
            return response.status(404).json({
                message : "Cart item not found",
                error : true,
                success : false
            })
        }

        // Kiểm tra sản phẩm có đang bán không
        if(!cartItem.productId) {
            return response.status(400).json({
                message : "Sản phẩm không tồn tại",
                error : true,
                success : false
            })
        }

        if(!cartItem.productId.publish) {
            return response.status(400).json({
                message : "Sản phẩm này đã ngừng bán. Vui lòng xóa khỏi giỏ hàng.",
                error : true,
                success : false
            })
        }

        // Kiểm tra tồn kho
        if(cartItem.productId.stock < qty) {
            return response.status(400).json({
                message : `Chỉ còn ${cartItem.productId.stock} sản phẩm trong kho`,
                error : true,
                success : false
            })
        }

        const updateCartitem = await CartProductModel.updateOne({
            _id : _id,
            userId : userId
        },{
            quantity : qty
        })

        // 📊 Track metrics
        metrics.recordCartAction('updated');

        return response.json({
            message : "Update cart",
            success : true,
            error : false, 
            data : updateCartitem
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteCartItemQtyController = async(request,response)=>{
    try {
      const userId = request.userId // middleware
      const { _id } = request.body 
      
      if(!_id){
        return response.status(400).json({
            message : "Provide _id",
            error : true,
            success : false
        })
      }

      const deleteCartItem = await CartProductModel.deleteOne({_id : _id, userId : userId })

      // 📊 Track metrics
      metrics.recordCartAction('removed');

      return response.json({
        message : "Item remove",
        error : false,
        success : true,
        data : deleteCartItem
      })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// THÊM: API MỚI để validate cart trước khi checkout
export const validateCartForCheckout = async(request, response) => {
    try {
        const userId = request.userId

        const cartItems = await CartProductModel.find({
            userId: userId
        }).populate('productId')

        // Kiểm tra các vấn đề
        const issues = []
        
        for(const item of cartItems) {
            const product = item.productId
            
            if(!product) {
                issues.push({
                    productId: item.productId,
                    productName: 'Unknown',
                    type: 'not_found',
                    message: `Sản phẩm không tồn tại`
                })
                continue
            }
            
            if(!product.publish) {
                issues.push({
                    productId: product._id,
                    productName: product.name,
                    type: 'discontinued',
                    message: `Sản phẩm "${product.name}" đã ngừng bán`
                })
            }
            
            if(product.stock <= 0) {
                issues.push({
                    productId: product._id,
                    productName: product.name,
                    type: 'out_of_stock',
                    message: `Sản phẩm "${product.name}" đã hết hàng`
                })
            }
            
            if(product.stock > 0 && product.stock < item.quantity) {
                issues.push({
                    productId: product._id,
                    productName: product.name,
                    type: 'insufficient_stock',
                    message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho (bạn đang chọn ${item.quantity})`
                })
            }
        }

        const canCheckout = issues.length === 0

        return response.json({
            canCheckout: canCheckout,
            issues: issues,
            message: canCheckout ? "Giỏ hàng hợp lệ" : "Có vấn đề với giỏ hàng",
            error: !canCheckout,
            success: canCheckout
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
