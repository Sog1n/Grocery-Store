import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {
        type : String,
    },
    name_no_accent: {
        type: String,
        default: ""
    },
    image : {
        type : Array,
        default : []
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'subCategory'
        }
    ],
    unit : {
        type : String,
        default : ""
    },
    stock : {
        type : Number,
        default : null
    },
    price : {
        type : Number,
        defualt : null
    },
    discount : {
        type : Number,
        default : null
    },
    description : {
        type : String,
        default : ""
    },
    more_details : {
        type : Object,
        default : {}
    },
    publish : {
        type : Boolean,
        default : true
    }
},{
    timestamps : true
})

// Thêm indexes để tăng tốc độ tìm kiếm
productSchema.index({ name: 1 })
productSchema.index({ name_no_accent: 1 })
productSchema.index({ price: 1 })
productSchema.index({ category: 1 })
productSchema.index({ subCategory: 1 })
productSchema.index({ createdAt: -1 })

// Compound index cho tìm kiếm + filter
productSchema.index({ name: 1, category: 1, price: 1 })
productSchema.index({ name_no_accent: 1, category: 1, price: 1 })

const ProductModel = mongoose.model('product',productSchema)

export default ProductModel