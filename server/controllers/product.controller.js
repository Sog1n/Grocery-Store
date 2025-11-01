import ProductModel from "../models/product.model.js";

// ❌ KHÔNG DÙNG CHO USER - Chỉ dùng cho Admin
export const createProductController = async(request,response)=>{
    try {
        const { 
            name,
            name_no_accent,
            image,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            publish  // ← THÊM (nếu muốn tạo từ user side)
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const product = new ProductModel({
            name,
            name_no_accent,
            image,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            publish: publish !== undefined ? publish : true
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
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

// ✅ USER API - Chỉ lấy sản phẩm đang bán
export const getProductController = async(request,response)=>{
    try {
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        // ← THÊM FILTER publish: true
        const query = {
            publish: true  // ← CHỈ LẤY SẢN PHẨM ĐANG BÁN
        }

        // Text search
        if(search) {
            query.$text = {
                $search : search
            }
        }

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// ✅ USER API - Lấy sản phẩm theo category
export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        // ← THÊM FILTER publish: true
        const product = await ProductModel.find({ 
            category : { $in : id },
            publish: true  // ← CHỈ LẤY SẢN PHẨM ĐANG BÁN
        }).limit(15)

        return response.json({
            message : "category product list",
            data : product,
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

// ✅ USER API - Lấy sản phẩm theo category & subcategory
export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId,subCategoryId,page,limit } = request.body

        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        // ← THÊM FILTER publish: true
        const query = {
            category : { $in :categoryId  },
            subCategory : { $in : subCategoryId },
            publish: true  // ← CHỈ LẤY SẢN PHẨM ĐANG BÁN
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// ⚠️ SPECIAL CASE - Product Details
// Không filter publish vì user có thể vào link trực tiếp
// NHƯNG nên hiển thị warning nếu sản phẩm ngừng bán
export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        const product = await ProductModel.findOne({ _id : productId })

        if(!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            })
        }

        // ← THÊM FLAG để frontend biết sản phẩm ngừng bán
        return response.json({
            message : "product details",
            data : product,
            isDiscontinued: !product.publish,  // ← Flag này
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

// ❌ KHÔNG DÙNG CHO USER - Chỉ dùng cho Admin
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id },{
            ...request.body
        })

        return response.json({
            message : "updated successfully",
            data : updateProduct,
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

// ❌ KHÔNG DÙNG CHO USER - Chỉ dùng cho Admin
export const deleteProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.deleteOne({_id : _id })

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// ✅ USER API - Search & Filter
export const searchProduct = async(request,response)=>{
    try {
        let { search, page, limit, categoryId, subCategoryId, minPrice, maxPrice, sortBy } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit = 8
        }

        // ← THÊM FILTER publish: true
        let query = {
            publish: true  // ← CHỈ LẤY SẢN PHẨM ĐANG BÁN
        }
        
        // Text search with Regex
        if(search) {
            const searchRegex = new RegExp(search, 'i')
            query.$or = [
                { name: searchRegex },
                { name_no_accent: searchRegex }
            ]
        }

        // Filter by category
        if(categoryId && categoryId.length > 0) {
            query.category = { $in: categoryId }
        }

        // Filter by subcategory
        if(subCategoryId && subCategoryId.length > 0) {
            query.subCategory = { $in: subCategoryId }
        }

        // Filter by price range
        if(minPrice !== undefined || maxPrice !== undefined) {
            query.price = {}
            if(minPrice !== undefined && minPrice !== '') {
                query.price.$gte = Number(minPrice)
            }
            if(maxPrice !== undefined && maxPrice !== '') {
                query.price.$lte = Number(maxPrice)
            }
        }

        // Sort options
        let sortOptions = {}
        if(sortBy === 'price_asc') {
            sortOptions = { price: 1 }
        } else if(sortBy === 'price_desc') {
            sortOptions = { price: -1 }
        } else if(sortBy === 'name') {
            sortOptions = { name: 1 }
        } else {
            sortOptions = { createdAt: -1 }
        }

        const skip = (page - 1) * limit

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message: "Product data",
            error: false,
            success: true,
            data: data,
            totalCount: dataCount,
            totalPage: Math.ceil(dataCount/limit),
            page: page,
            limit: limit
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}