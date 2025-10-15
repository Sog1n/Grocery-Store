// import UserModel from '../models/user.model.js'
// import bcryptjs from 'bcryptjs'
//
// const seedUsers = async () => {
//     try {
//         // Kiểm tra xem đã có user admin chưa
//         const existingAdmin = await UserModel.findOne({ role: 'ADMIN' })
//         const existingUser = await UserModel.findOne({ role: 'USER' })
//
//         // Tạo admin nếu chưa có
//         if (!existingAdmin) {
//             const adminPassword = await bcryptjs.hash('123', 12)
//             const adminUser = new UserModel({
//                 name: 'Admin',
//                 email: 'admin@gmail.com',
//                 password: adminPassword,
//                 role: 'ADMIN',
//                 verify_email: true,
//                 status: 'Active'
//             })
//             await adminUser.save()
//             console.log('✅ Admin user created: admin@gmail.com / 123')
//         } else {
//             console.log('ℹ️  Admin user already exists')
//         }
//
//         // Tạo user thường nếu chưa có
//         if (!existingUser) {
//             const userPassword = await bcryptjs.hash('123', 12)
//             const normalUser = new UserModel({
//                 name: 'nguyenphuongvinh',
//                 email: 'nguyenphuongvinh49@gmail.com',
//                 password: userPassword,
//                 role: 'USER',
//                 verify_email: true,
//                 status: 'Active'
//             })
//             await normalUser.save()
//             console.log('✅ Regular user created: nguyenphuongvinh49@gmail.com / 123')
//         } else {
//             console.log('ℹ️  Regular user already exists')
//         }
//
//     } catch (error) {
//         console.error('❌ Error seeding users:', error.message)
//     }
// }
//
// export default seedUsers