import promClient from 'prom-client';

// Tạo Registry để quản lý metrics
const register = new promClient.Registry();

// Thêm default metrics (CPU, Memory, etc.)
promClient.collectDefaultMetrics({
    register,
    prefix: 'grocery_store_backend_'
});

// ═══════════════════════════════════════════════════════════
// CUSTOM METRICS CHO GROCERY STORE
// ═══════════════════════════════════════════════════════════

// 1. HTTP Request Duration Histogram
const httpRequestDuration = new promClient.Histogram({
    name: 'grocery_store_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// 2. HTTP Request Counter
const httpRequestTotal = new promClient.Counter({
    name: 'grocery_store_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// 3. Active Requests Gauge
const activeRequests = new promClient.Gauge({
    name: 'grocery_store_active_requests',
    help: 'Number of active requests being processed'
});

// 4. Order Metrics
const ordersTotal = new promClient.Counter({
    name: 'grocery_store_orders_total',
    help: 'Total number of orders created',
    labelNames: ['status']
});

const ordersValue = new promClient.Counter({
    name: 'grocery_store_orders_value_total',
    help: 'Total value of orders (in VND)',
    labelNames: ['status']
});

// 5. Payment Metrics
const paymentsTotal = new promClient.Counter({
    name: 'grocery_store_payments_total',
    help: 'Total number of payments',
    labelNames: ['status', 'method']
});

const paymentsValue = new promClient.Counter({
    name: 'grocery_store_payments_value_total',
    help: 'Total payment value (in VND)',
    labelNames: ['status', 'method']
});

// 6. User Metrics
const usersTotal = new promClient.Counter({
    name: 'grocery_store_users_total',
    help: 'Total number of registered users',
    labelNames: ['status']
});

const usersActive = new promClient.Gauge({
    name: 'grocery_store_users_active',
    help: 'Number of currently active users'
});

// 7. Product Metrics
const productsTotal = new promClient.Gauge({
    name: 'grocery_store_products_total',
    help: 'Total number of products in catalog',
    labelNames: ['publish_status']
});

const productStockValue = new promClient.Gauge({
    name: 'grocery_store_product_stock_value',
    help: 'Total stock value of products',
    labelNames: ['category']
});

const productsOutOfStock = new promClient.Gauge({
    name: 'grocery_store_products_out_of_stock',
    help: 'Number of products that are out of stock'
});

// 8. Cart Metrics
const cartItemsTotal = new promClient.Counter({
    name: 'grocery_store_cart_items_total',
    help: 'Total number of items added to cart',
    labelNames: ['action'] // 'added', 'removed', 'updated'
});

const activeCartsGauge = new promClient.Gauge({
    name: 'grocery_store_active_carts',
    help: 'Number of active shopping carts'
});

// 9. Category Metrics
const categoriesTotal = new promClient.Gauge({
    name: 'grocery_store_categories_total',
    help: 'Total number of categories'
});

const subCategoriesTotal = new promClient.Gauge({
    name: 'grocery_store_subcategories_total',
    help: 'Total number of subcategories'
});

// 10. Database Connection Status
const dbConnectionStatus = new promClient.Gauge({
    name: 'grocery_store_db_connection_status',
    help: 'MongoDB connection status (1 = connected, 0 = disconnected)'
});

// 11. API Errors
const apiErrors = new promClient.Counter({
    name: 'grocery_store_api_errors_total',
    help: 'Total number of API errors',
    labelNames: ['method', 'route', 'error_type']
});

// 12. Authentication Metrics
const authAttempts = new promClient.Counter({
    name: 'grocery_store_auth_attempts_total',
    help: 'Total authentication attempts',
    labelNames: ['type', 'status'] // type: 'login', 'register', 'forgot_password'; status: 'success', 'failed'
});

// 13. File Upload Metrics
const fileUploadsTotal = new promClient.Counter({
    name: 'grocery_store_file_uploads_total',
    help: 'Total number of file uploads',
    labelNames: ['type', 'status'] // type: 'product_image', 'avatar'; status: 'success', 'failed'
});

// 14. Address Metrics
const addressesTotal = new promClient.Counter({
    name: 'grocery_store_addresses_total',
    help: 'Total number of delivery addresses created',
    labelNames: ['action'] // 'created', 'updated', 'disabled'
});

// 15. VNPay Payment Metrics
const vnpayTransactions = new promClient.Counter({
    name: 'grocery_store_vnpay_transactions_total',
    help: 'Total number of VNPay transactions',
    labelNames: ['status'] // 'created', 'success', 'failed', 'pending'
});

const vnpayTransactionValue = new promClient.Counter({
    name: 'grocery_store_vnpay_transaction_value_total',
    help: 'Total value of VNPay transactions (in VND)',
    labelNames: ['status']
});

// 16. Stripe Payment Metrics
const stripeTransactions = new promClient.Counter({
    name: 'grocery_store_stripe_transactions_total',
    help: 'Total number of Stripe transactions',
    labelNames: ['status']
});

const stripeTransactionValue = new promClient.Counter({
    name: 'grocery_store_stripe_transaction_value_total',
    help: 'Total value of Stripe transactions',
    labelNames: ['status']
});

// 17. COD (Cash on Delivery) Metrics
const codOrders = new promClient.Counter({
    name: 'grocery_store_cod_orders_total',
    help: 'Total number of Cash on Delivery orders',
    labelNames: ['status']
});

const codOrderValue = new promClient.Counter({
    name: 'grocery_store_cod_order_value_total',
    help: 'Total value of COD orders (in VND)',
    labelNames: ['status']
});

// Register all custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeRequests);
register.registerMetric(ordersTotal);
register.registerMetric(ordersValue);
register.registerMetric(paymentsTotal);
register.registerMetric(paymentsValue);
register.registerMetric(usersTotal);
register.registerMetric(usersActive);
register.registerMetric(productsTotal);
register.registerMetric(productStockValue);
register.registerMetric(productsOutOfStock);
register.registerMetric(cartItemsTotal);
register.registerMetric(activeCartsGauge);
register.registerMetric(categoriesTotal);
register.registerMetric(subCategoriesTotal);
register.registerMetric(dbConnectionStatus);
register.registerMetric(apiErrors);
register.registerMetric(authAttempts);
register.registerMetric(fileUploadsTotal);
register.registerMetric(addressesTotal);
register.registerMetric(vnpayTransactions);
register.registerMetric(vnpayTransactionValue);
register.registerMetric(stripeTransactions);
register.registerMetric(stripeTransactionValue);
register.registerMetric(codOrders);
register.registerMetric(codOrderValue);

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE TO TRACK HTTP REQUESTS
// ═══════════════════════════════════════════════════════════

export const prometheusMiddleware = (req, res, next) => {
    // Bỏ qua metrics endpoint
    if (req.path === '/metrics') {
        return next();
    }

    const start = Date.now();
    activeRequests.inc();

    // Override res.end để capture response
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;

        // Record metrics
        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode },
            duration
        );

        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode
        });

        // Track errors
        if (res.statusCode >= 400) {
            apiErrors.inc({
                method: req.method,
                route,
                error_type: res.statusCode >= 500 ? 'server_error' : 'client_error'
            });
        }

        activeRequests.dec();
        originalEnd.apply(res, args);
    };

    next();
};

// ═══════════════════════════════════════════════════════════
// FUNCTIONS TO UPDATE CUSTOM METRICS FROM CONTROLLERS
// ═══════════════════════════════════════════════════════════

export const metrics = {
    // Initialize metrics with 0 values to make them visible in Prometheus
    initialize: () => {
        console.log('🔧 Initializing Prometheus metrics for Grocery Store...');
        
        // Initialize order metrics with 0
        const orderStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
        orderStatuses.forEach(status => {
            ordersTotal.inc({ status }, 0);
            ordersValue.inc({ status }, 0);
        });

        // Initialize payment metrics with 0
        const paymentMethods = ['cod', 'stripe', 'vnpay'];
        const paymentStatuses = ['pending', 'success', 'failed', 'paid'];
        paymentMethods.forEach(method => {
            paymentStatuses.forEach(status => {
                paymentsTotal.inc({ status, method }, 0);
                paymentsValue.inc({ status, method }, 0);
            });
        });

        // Initialize user metrics with 0
        const userStatuses = ['Active', 'Inactive', 'Suspended'];
        userStatuses.forEach(status => {
            usersTotal.inc({ status }, 0);
        });

        // Initialize VNPay metrics
        vnpayTransactions.inc({ status: 'created' }, 0);
        vnpayTransactions.inc({ status: 'success' }, 0);
        vnpayTransactions.inc({ status: 'failed' }, 0);
        vnpayTransactions.inc({ status: 'pending' }, 0);
        
        vnpayTransactionValue.inc({ status: 'created' }, 0);
        vnpayTransactionValue.inc({ status: 'success' }, 0);
        vnpayTransactionValue.inc({ status: 'failed' }, 0);
        vnpayTransactionValue.inc({ status: 'pending' }, 0);

        // Initialize Stripe metrics
        stripeTransactions.inc({ status: 'created' }, 0);
        stripeTransactions.inc({ status: 'success' }, 0);
        stripeTransactions.inc({ status: 'failed' }, 0);
        
        stripeTransactionValue.inc({ status: 'created' }, 0);
        stripeTransactionValue.inc({ status: 'success' }, 0);
        stripeTransactionValue.inc({ status: 'failed' }, 0);

        // Initialize COD metrics
        codOrders.inc({ status: 'created' }, 0);
        codOrders.inc({ status: 'delivered' }, 0);
        codOrders.inc({ status: 'cancelled' }, 0);
        
        codOrderValue.inc({ status: 'created' }, 0);
        codOrderValue.inc({ status: 'delivered' }, 0);
        codOrderValue.inc({ status: 'cancelled' }, 0);

        // Initialize cart metrics
        cartItemsTotal.inc({ action: 'added' }, 0);
        cartItemsTotal.inc({ action: 'removed' }, 0);
        cartItemsTotal.inc({ action: 'updated' }, 0);

        // Initialize auth metrics
        authAttempts.inc({ type: 'login', status: 'success' }, 0);
        authAttempts.inc({ type: 'login', status: 'failed' }, 0);
        authAttempts.inc({ type: 'register', status: 'success' }, 0);
        authAttempts.inc({ type: 'register', status: 'failed' }, 0);

        // Initialize file upload metrics
        fileUploadsTotal.inc({ type: 'product_image', status: 'success' }, 0);
        fileUploadsTotal.inc({ type: 'product_image', status: 'failed' }, 0);
        fileUploadsTotal.inc({ type: 'avatar', status: 'success' }, 0);
        fileUploadsTotal.inc({ type: 'avatar', status: 'failed' }, 0);

        // Initialize address metrics
        addressesTotal.inc({ action: 'created' }, 0);
        addressesTotal.inc({ action: 'updated' }, 0);
        addressesTotal.inc({ action: 'disabled' }, 0);

        console.log('✅ Prometheus metrics initialized');
    },

    // Load existing data from database and populate metrics
    loadExistingData: async () => {
        try {
            console.log('📊 Loading existing data from database to populate metrics...');

            // Dynamically import models to avoid circular dependencies
            const { default: OrderModel } = await import('../models/order.model.js');
            const { default: UserModel } = await import('../models/user.model.js');
            const { default: ProductModel } = await import('../models/product.model.js');
            const { default: CategoryModel } = await import('../models/category.model.js');
            const { default: SubCategoryModel } = await import('../models/subCategory.model.js');
            const { default: CartProductModel } = await import('../models/cartproduct.model.js');

            // Load and count orders by status
            const orders = await OrderModel.find({});
            const ordersByStatus = orders.reduce((acc, order) => {
                const status = order.order_status || 'pending';
                if (!acc[status]) acc[status] = { count: 0, value: 0 };
                acc[status].count++;
                acc[status].value += order.totalAmt || 0;
                return acc;
            }, {});

            // Update order metrics with actual counts
            for (const [status, data] of Object.entries(ordersByStatus)) {
                ordersTotal.inc({ status }, data.count);
                ordersValue.inc({ status }, data.value);
                console.log(`  📦 Loaded ${data.count} orders with status "${status}" (total value: ${data.value} VND)`);
            }

            // Load and count payments by method and status
            const paymentsByMethod = orders.reduce((acc, order) => {
                let method = 'cod';
                let status = order.payment_status?.toLowerCase() || 'pending';
                
                // Determine payment method based on paymentId or payment_status
                if (order.paymentId) {
                    if (order.paymentId.includes('vnpay') || order.payment_status === 'PENDING' || order.payment_status === 'SUCCESS') {
                        method = 'vnpay';
                    } else {
                        method = 'stripe';
                    }
                }

                const key = `${status}_${method}`;
                if (!acc[key]) acc[key] = { status, method, count: 0, value: 0 };
                acc[key].count++;
                acc[key].value += order.totalAmt || 0;
                return acc;
            }, {});

            // Update payment metrics
            for (const data of Object.values(paymentsByMethod)) {
                paymentsTotal.inc({ status: data.status, method: data.method }, data.count);
                paymentsValue.inc({ status: data.status, method: data.method }, data.value);
                console.log(`  💳 Loaded ${data.count} ${data.method} payments with status "${data.status}" (total value: ${data.value} VND)`);
            }

            // Load and count users by status
            const users = await UserModel.find({});
            const usersByStatus = users.reduce((acc, user) => {
                const status = user.status || 'Active';
                if (!acc[status]) acc[status] = 0;
                acc[status]++;
                return acc;
            }, {});

            for (const [status, count] of Object.entries(usersByStatus)) {
                usersTotal.inc({ status }, count);
                console.log(`  👥 Loaded ${count} users with status "${status}"`);
            }

            // Count active users (logged in within last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const activeUsersCount = users.filter(u => u.last_login_date && new Date(u.last_login_date) > thirtyDaysAgo).length;
            usersActive.set(activeUsersCount);
            console.log(`  👥 ${activeUsersCount} active users (logged in within 30 days)`);

            // Load and count products
            const products = await ProductModel.find({});
            const publishedProducts = products.filter(p => p.publish === true).length;
            const unpublishedProducts = products.filter(p => p.publish === false).length;
            const outOfStockProducts = products.filter(p => p.stock === 0 || p.stock === null).length;

            productsTotal.set({ publish_status: 'published' }, publishedProducts);
            productsTotal.set({ publish_status: 'unpublished' }, unpublishedProducts);
            productsOutOfStock.set(outOfStockProducts);
            console.log(`  📦 Loaded ${publishedProducts} published products, ${unpublishedProducts} unpublished products`);
            console.log(`  ⚠️  ${outOfStockProducts} products out of stock`);

            // Load categories and subcategories
            const categories = await CategoryModel.countDocuments({});
            const subCategories = await SubCategoryModel.countDocuments({});
            categoriesTotal.set(categories);
            subCategoriesTotal.set(subCategories);
            console.log(`  🏷️  Loaded ${categories} categories and ${subCategories} subcategories`);

            // Load active carts
            const activeCarts = await CartProductModel.distinct('userId');
            activeCartsGauge.set(activeCarts.length);
            console.log(`  🛒 ${activeCarts.length} active shopping carts`);

            console.log('✅ Successfully loaded existing data into metrics');
        } catch (error) {
            console.error('❌ Error loading existing data into metrics:', error);
        }
    },

    // Order metrics
    recordOrder: (status, value) => {
        console.log(`📊 Recording order metric: status=${status}, value=${value} VND`);
        ordersTotal.inc({ status });
        if (value) {
            ordersValue.inc({ status }, value);
        }
        console.log(`✅ Order metric recorded successfully`);
    },

    // Payment metrics
    recordPayment: (status, method, value) => {
        console.log(`📊 Recording payment metric: status=${status}, method=${method}, value=${value}`);
        paymentsTotal.inc({ status, method });
        if (value) {
            paymentsValue.inc({ status, method }, value);
        }
        console.log(`✅ Payment metric recorded successfully`);
    },

    // VNPay specific metrics
    recordVNPayTransaction: (status, value) => {
        console.log(`📊 Recording VNPay transaction: status=${status}, value=${value} VND`);
        vnpayTransactions.inc({ status });
        if (value) {
            vnpayTransactionValue.inc({ status }, value);
        }
        console.log(`✅ VNPay transaction metric recorded successfully`);
    },

    // Stripe specific metrics
    recordStripeTransaction: (status, value) => {
        console.log(`📊 Recording Stripe transaction: status=${status}, value=${value}`);
        stripeTransactions.inc({ status });
        if (value) {
            stripeTransactionValue.inc({ status }, value);
        }
        console.log(`✅ Stripe transaction metric recorded successfully`);
    },

    // COD specific metrics
    recordCODOrder: (status, value) => {
        console.log(`📊 Recording COD order: status=${status}, value=${value} VND`);
        codOrders.inc({ status });
        if (value) {
            codOrderValue.inc({ status }, value);
        }
        console.log(`✅ COD order metric recorded successfully`);
    },

    // User metrics
    recordUser: (status) => {
        console.log(`📊 Recording user metric: status=${status}`);
        usersTotal.inc({ status });
        console.log(`✅ User metric recorded successfully`);
    },

    updateActiveUsers: (count) => {
        usersActive.set(count);
    },

    // Product metrics
    updateProductStats: (publishedCount, unpublishedCount, outOfStockCount) => {
        productsTotal.set({ publish_status: 'published' }, publishedCount);
        productsTotal.set({ publish_status: 'unpublished' }, unpublishedCount);
        productsOutOfStock.set(outOfStockCount);
    },

    // Cart metrics
    recordCartAction: (action) => {
        console.log(`📊 Recording cart action: ${action}`);
        cartItemsTotal.inc({ action });
        console.log(`✅ Cart action recorded successfully`);
    },

    updateActiveCarts: (count) => {
        activeCartsGauge.set(count);
    },

    // Category metrics
    updateCategoryCounts: (categoryCount, subCategoryCount) => {
        categoriesTotal.set(categoryCount);
        subCategoriesTotal.set(subCategoryCount);
    },

    // Database connection status
    setDbStatus: (connected) => {
        dbConnectionStatus.set(connected ? 1 : 0);
    },

    // Authentication metrics
    recordAuthAttempt: (type, status) => {
        console.log(`📊 Recording auth attempt: type=${type}, status=${status}`);
        authAttempts.inc({ type, status });
        console.log(`✅ Auth attempt recorded successfully`);
    },

    // File upload metrics
    recordFileUpload: (type, status) => {
        console.log(`📊 Recording file upload: type=${type}, status=${status}`);
        fileUploadsTotal.inc({ type, status });
        console.log(`✅ File upload recorded successfully`);
    },

    // Address metrics
    recordAddress: (action) => {
        console.log(`📊 Recording address action: ${action}`);
        addressesTotal.inc({ action });
        console.log(`✅ Address action recorded successfully`);
    }
};

// Export register để expose metrics endpoint
export { register };

// Endpoint handler cho /metrics
export const metricsHandler = async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    const metricsData = await register.metrics();
    res.send(metricsData);
};

