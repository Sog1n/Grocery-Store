import UserModel from '../../models/user.model.js';
import ProductModel from '../../models/product.model.js';
import AddressModel from '../../models/address.model.js';
import CategoryModel from '../../models/category.model.js';
import SubCategoryModel from '../../models/subCategory.model.js';
import CartProductModel from '../../models/cartproduct.model.js';
import OrderModel from '../../models/order.model.js';
import bcryptjs from 'bcryptjs';
import generatedAccessToken from '../../utils/generatedAccessToken.js';
import mongoose from 'mongoose';

/**
 * Tạo test user với password đã hash
 * @param {Object} data - User data override
 * @returns {Object} { user, token }
 */
export async function createTestUser(data = {}) {
  const hashedPassword = await bcryptjs.hash(data.password || 'password123', 10);
  
  const user = await UserModel.create({
    name: data.name || 'Test User',
    email: data.email || `test${Date.now()}@example.com`,
    password: hashedPassword,
    mobile: data.mobile || '0123456789',
    role: data.role || 'GENERAL',
    status: data.status || 'Active',
    verify_email: data.verify_email !== undefined ? data.verify_email : true,
    shopping_cart: data.shopping_cart || [],
    ...data
  });
  
  // Tạo access token cho user
  const token = await generatedAccessToken(user._id);
  
  return { user, token };
}

/**
 * Tạo test product
 * @param {Object} data - Product data override
 * @returns {Object} Product document
 */
export async function createTestProduct(data = {}) {
  const product = await ProductModel.create({
    name: data.name || `Test Product ${Date.now()}`,
    image: data.image || ['test-image.jpg'],
    category: data.category || [],
    subCategory: data.subCategory || [],
    unit: data.unit || 'piece',
    stock: data.stock !== undefined ? data.stock : 100,
    price: data.price !== undefined ? data.price : 1000,
    discount: data.discount || 0,
    description: data.description || 'Test product description',
    more_details: data.more_details || {},
    publish: data.publish !== undefined ? data.publish : true,
    ...data
  });
  
  return product;
}

/**
 * Tạo test address cho user
 * @param {String} userId - User ID
 * @param {Object} data - Address data override
 * @returns {Object} Address document
 */
export async function createTestAddress(userId, data = {}) {
  const address = await AddressModel.create({
    address_line: data.address_line || '123 Test Street',
    city: data.city || 'Test City',
    state: data.state || 'Test State',
    pincode: data.pincode || '100000',
    country: data.country || 'Vietnam',
    mobile: data.mobile || '0123456789',
    status: data.status !== undefined ? data.status : true,
    userId: userId,
    ...data
  });
  
  return address;
}

/**
 * Tạo test category
 * @param {Object} data - Category data override
 * @returns {Object} Category document
 */
export async function createTestCategory(data = {}) {
  const category = await CategoryModel.create({
    name: data.name || `Test Category ${Date.now()}`,
    image: data.image || 'test-category.jpg',
    ...data
  });
  
  return category;
}

/**
 * Tạo test subcategory
 * @param {Array} categoryIds - Array of category IDs
 * @param {Object} data - SubCategory data override
 * @returns {Object} SubCategory document
 */
export async function createTestSubCategory(categoryIds = [], data = {}) {
  const subCategory = await SubCategoryModel.create({
    name: data.name || `Test SubCategory ${Date.now()}`,
    image: data.image || 'test-subcategory.jpg',
    category: categoryIds.length > 0 ? categoryIds : [],
    ...data
  });
  
  return subCategory;
}

/**
 * Tạo cart item cho user
 * @param {String} userId - User ID
 * @param {String} productId - Product ID
 * @param {Number} quantity - Quantity
 * @returns {Object} CartProduct document
 */
export async function createTestCartItem(userId, productId, quantity = 1) {
  const cartItem = await CartProductModel.create({
    productId: productId,
    quantity: quantity,
    userId: userId
  });
  
  // Update user shopping_cart
  await UserModel.findByIdAndUpdate(userId, {
    $push: { shopping_cart: cartItem._id }
  });
  
  return cartItem;
}

/**
 * Tạo test order
 * @param {String} userId - User ID
 * @param {Object} data - Order data override
 * @returns {Object} Order document
 */
export async function createTestOrder(userId, data = {}) {
  const order = await OrderModel.create({
    userId: userId,
    orderId: data.orderId || `ORD-${new mongoose.Types.ObjectId()}`,
    items: data.items || [],
    paymentId: data.paymentId || '',
    payment_status: data.payment_status || 'PENDING',
    delivery_address: data.delivery_address || null,
    subTotalAmt: data.subTotalAmt || 0,
    totalAmt: data.totalAmt || 0,
    order_status: data.order_status || 'pending',
    ...data
  });
  
  return order;
}

/**
 * Tạo admin user
 * @param {Object} data - User data override
 * @returns {Object} { user, token }
 */
export async function createTestAdmin(data = {}) {
  return createTestUser({
    ...data,
    role: 'ADMIN',
    email: data.email || `admin${Date.now()}@example.com`,
    name: data.name || 'Test Admin'
  });
}

/**
 * Tạo multiple products cùng lúc
 * @param {Number} count - Số lượng products cần tạo
 * @param {Object} baseData - Base data cho products
 * @returns {Array} Array of product documents
 */
export async function createMultipleTestProducts(count = 5, baseData = {}) {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const product = await createTestProduct({
      ...baseData,
      name: `${baseData.name || 'Test Product'} ${i + 1}`,
      price: baseData.price || (1000 + i * 100)
    });
    products.push(product);
  }
  
  return products;
}

/**
 * Helper: Đợi một khoảng thời gian (ms)
 * @param {Number} ms - Milliseconds
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper: Tạo random email
 */
export function generateRandomEmail() {
  return `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Helper: Tạo random phone number
 */
export function generateRandomPhone() {
  return `0${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
}
