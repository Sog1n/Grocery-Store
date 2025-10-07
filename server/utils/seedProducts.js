import CategoryModel from '../models/category.model.js'
import SubCategoryModel from '../models/subCategory.model.js'
import ProductModel from '../models/product.model.js'

const seedProducts = async () => {
    try {
        // Kiểm tra xem đã có dữ liệu chưa
        const existingCategories = await CategoryModel.countDocuments()
        if (existingCategories > 0) {
            console.log('📦 Dữ liệu sản phẩm đã tồn tại, bỏ qua seed')
            return
        }

        console.log('🌱 Bắt đầu tạo dữ liệu mẫu...')

        // 1. Tạo Categories
        const categories = await CategoryModel.insertMany([
            {
                name: 'Thực phẩm tươi sống',
                image: 'https://res.cloudinary.com/demo/image/upload/v1/food/vegetables'
            },
            {
                name: 'Đồ uống',
                image: 'https://res.cloudinary.com/demo/image/upload/v1/food/drinks'
            },
            {
                name: 'Bánh kẹo snack',
                image: 'https://res.cloudinary.com/demo/image/upload/v1/food/snacks'
            },
            {
                name: 'Gia vị nấu ăn',
                image: 'https://res.cloudinary.com/demo/image/upload/v1/food/spices'
            },
            {
                name: 'Chăm sóc cá nhân',
                image: 'https://res.cloudinary.com/demo/image/upload/v1/personal/care'
            }
        ])

        console.log('✅ Đã tạo', categories.length, 'categories')

        // 2. Tạo SubCategories
        const subCategories = await SubCategoryModel.insertMany([
            // Thực phẩm tươi sống
            { name: 'Rau củ quả', image: 'https://via.placeholder.com/200x150/8BC34A/white?text=Rau+Cu', category: [categories[0]._id] },
            { name: 'Thịt tươi', image: 'https://via.placeholder.com/200x150/F44336/white?text=Thit+Tuoi', category: [categories[0]._id] },
            { name: 'Hải sản', image: 'https://via.placeholder.com/200x150/00BCD4/white?text=Hai+San', category: [categories[0]._id] },
            
            // Đồ uống
            { name: 'Nước ngọt', image: 'https://via.placeholder.com/200x150/3F51B5/white?text=Nuoc+Ngot', category: [categories[1]._id] },
            { name: 'Nước suối', image: 'https://via.placeholder.com/200x150/00E676/white?text=Nuoc+Suoi', category: [categories[1]._id] },
            { name: 'Bia rượu', image: 'https://via.placeholder.com/200x150/795548/white?text=Bia+Ruou', category: [categories[1]._id] },
            
            // Bánh kẹo
            { name: 'Bánh quy', image: 'https://via.placeholder.com/200x150/FFC107/white?text=Banh+Quy', category: [categories[2]._id] },
            { name: 'Kẹo', image: 'https://via.placeholder.com/200x150/E1BEE7/white?text=Keo', category: [categories[2]._id] },
            
            // Gia vị
            { name: 'Nước mắm', image: 'https://via.placeholder.com/200x150/6D4C41/white?text=Nuoc+Mam', category: [categories[3]._id] },
            { name: 'Gia vị khô', image: 'https://via.placeholder.com/200x150/FF5722/white?text=Gia+Vi+Kho', category: [categories[3]._id] },
            
            // Chăm sóc cá nhân
            { name: 'Dầu gội', image: 'https://via.placeholder.com/200x150/009688/white?text=Dau+Goi', category: [categories[4]._id] },
            { name: 'Kem đánh răng', image: 'https://via.placeholder.com/200x150/607D8B/white?text=Kem+Danh+Rang', category: [categories[4]._id] }
        ])

        console.log('✅ Đã tạo', subCategories.length, 'subcategories')

        // 3. Tạo Products
        const products = [
            // Rau củ quả
            {
                name: 'Cà chua bi',
                image: ['https://via.placeholder.com/400x300/FF5722/white?text=Ca+Chua+Bi'],
                category: [categories[0]._id],
                subCategory: [subCategories[0]._id],
                unit: 'kg',
                stock: 100,
                price: 35000,
                discount: 5,
                description: 'Cà chua bi tươi ngon, giàu vitamin C',
                more_details: { origin: 'Đà Lạt', shelf_life: '3-5 ngày' },
                publish: true
            },
            {
                name: 'Rau muống',
                image: ['https://via.placeholder.com/400x300/4CAF50/white?text=Rau+Muong'],
                category: [categories[0]._id],
                subCategory: [subCategories[0]._id],
                unit: 'bó',
                stock: 50,
                price: 8000,
                discount: 0,
                description: 'Rau muống tươi, không thuốc trừ sâu',
                more_details: { origin: 'Hà Nội', shelf_life: '1-2 ngày' },
                publish: true
            },
            {
                name: 'Thịt ba chỉ',
                image: ['https://via.placeholder.com/400x300/E91E63/white?text=Thit+Ba+Chi'],
                category: [categories[0]._id],
                subCategory: [subCategories[1]._id],
                unit: 'kg',
                stock: 30,
                price: 180000,
                discount: 10,
                description: 'Thịt ba chỉ tươi ngon, đảm bảo vệ sinh an toàn thực phẩm',
                more_details: { origin: 'Việt Nam', shelf_life: '2-3 ngày' },
                publish: true
            },
            
            // Đồ uống
            {
                name: 'Coca Cola 330ml',
                image: ['https://via.placeholder.com/400x300/DC143C/white?text=Coca+Cola'],
                category: [categories[1]._id],
                subCategory: [subCategories[3]._id],
                unit: 'lon',
                stock: 200,
                price: 12000,
                discount: 0,
                description: 'Nước ngọt Coca Cola lon 330ml',
                more_details: { brand: 'Coca Cola', expiry: '12 tháng' },
                publish: true
            },
            {
                name: 'Nước suối Aquafina 500ml',
                image: ['https://via.placeholder.com/400x300/1E90FF/white?text=Aquafina'],
                category: [categories[1]._id],
                subCategory: [subCategories[4]._id],
                unit: 'chai',
                stock: 150,
                price: 8000,
                discount: 0,
                description: 'Nước suối tinh khiết Aquafina',
                more_details: { brand: 'Aquafina', expiry: '24 tháng' },
                publish: true
            },
            
            // Bánh kẹo
            {
                name: 'Bánh quy Oreo',
                image: ['https://via.placeholder.com/400x300/000000/white?text=Oreo'],
                category: [categories[2]._id],
                subCategory: [subCategories[6]._id],
                unit: 'gói',
                stock: 80,
                price: 25000,
                discount: 15,
                description: 'Bánh quy Oreo vị socola thơm ngon',
                more_details: { brand: 'Oreo', weight: '137g', expiry: '18 tháng' },
                publish: true
            },
            {
                name: 'Kẹo dẻo Haribo',
                image: ['https://via.placeholder.com/400x300/FFD700/white?text=Haribo'],
                category: [categories[2]._id],
                subCategory: [subCategories[7]._id],
                unit: 'gói',
                stock: 60,
                price: 45000,
                discount: 0,
                description: 'Kẹo dẻo trái cây Haribo nhập khẩu',
                more_details: { brand: 'Haribo', weight: '200g', expiry: '24 tháng' },
                publish: true
            },
            
            // Gia vị
            {
                name: 'Nước mắm Nam Ngư',
                image: ['https://via.placeholder.com/400x300/8B4513/white?text=Nuoc+Mam'],
                category: [categories[3]._id],
                subCategory: [subCategories[8]._id],
                unit: 'chai',
                stock: 40,
                price: 35000,
                discount: 0,
                description: 'Nước mắm cá cơm Phan Thiết 40 độ đạm',
                more_details: { brand: 'Nam Ngư', volume: '500ml', expiry: '36 tháng' },
                publish: true
            },
            
            // Chăm sóc cá nhân
            {
                name: 'Dầu gội Head & Shoulders',
                image: ['https://via.placeholder.com/400x300/0066CC/white?text=Head+Shoulders'],
                category: [categories[4]._id],
                subCategory: [subCategories[10]._id],
                unit: 'chai',
                stock: 25,
                price: 89000,
                discount: 20,
                description: 'Dầu gội trị gàu Head & Shoulders',
                more_details: { brand: 'Head & Shoulders', volume: '400ml', hair_type: 'Mọi loại tóc' },
                publish: true
            },
            {
                name: 'Kem đánh răng P/S',
                image: ['https://via.placeholder.com/400x300/00CED1/white?text=PS+Toothpaste'],
                category: [categories[4]._id],
                subCategory: [subCategories[11]._id],
                unit: 'tuýp',
                stock: 35,
                price: 28000,
                discount: 0,
                description: 'Kem đánh răng P/S bảo vệ nướu',
                more_details: { brand: 'P/S', volume: '120g', benefit: 'Chống sâu răng' },
                publish: true
            }
        ]

        const createdProducts = await ProductModel.insertMany(products)
        console.log('✅ Đã tạo', createdProducts.length, 'sản phẩm')

        console.log('🎉 Hoàn thành tạo dữ liệu mẫu!')
        console.log(`📊 Tổng kết:`)
        console.log(`   - ${categories.length} danh mục`)
        console.log(`   - ${subCategories.length} danh mục con`)
        console.log(`   - ${createdProducts.length} sản phẩm`)

    } catch (error) {
        console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error)
    }
}

export default seedProducts