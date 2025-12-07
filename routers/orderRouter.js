
const express = require("express");
const router = express.Router();
const { orderController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingInfo,
  cancelOrder,
  deleteOrder,
  getOrderStatistics
} = orderController;

// =============================================
// PUBLIC/CUSTOMER ROUTES
// =============================================

// Tạo đơn hàng mới (có thể không cần login cho guest checkout)
// POST /api/v1/orders
// Body: { userId?, customer, shippingAddress, items, subtotal, shippingFee?, discount?, voucherCode?, loyaltyPointsUsed?, loyaltyPointsDiscount?, totalAmount, paymentMethod, note? }
router.post("/orders",createOrder);

// Lấy đơn hàng theo order number (cho guest tracking)
// GET /api/v1/orders/number/:orderNumber
router.get("/orders/number/:orderNumber", getOrderByNumber);
// Lấy danh sách đơn hàng của user đăng nhập
// GET /api/v1/orders/my-orders?page=1&limit=10&status=pending
router.get("/orders/my_orders", checkLogin, getUserOrders);

// Lấy đơn hàng theo ID
// GET /api/v1/orders/:id
router.get("/orders/:id", getOrderById);

// =============================================
// USER ROUTES (yêu cầu đăng nhập)
// =============================================


// Hủy đơn hàng (chỉ pending/confirmed)
// PUT /api/v1/orders/:id/cancel
// Body: { cancelReason? }
router.put("/orders/:id/cancel", cancelOrder);

// =============================================
// ADMIN ROUTES
// =============================================

// Lấy tất cả đơn hàng (admin)
// GET /api/v1/admin/orders?page=1&limit=20&status=pending&paymentStatus=paid&search=xxx&startDate=xxx&endDate=xxx
router.get("/admin/orders", checkLogin, checkAdmin, getAllOrders);

// Lấy đơn hàng của một user cụ thể (admin)
// GET /api/v1/admin/orders/user/:userId?page=1&limit=10&status=pending
router.get("/admin/orders/user/:userId", checkLogin, checkAdmin, getUserOrders);

// Cập nhật trạng thái đơn hàng
// PUT /api/v1/admin/orders/:id/status
// Body: { status, note? }
router.put("/admin/orders/:id/status", checkLogin, checkAdmin, updateOrderStatus);

// Cập nhật trạng thái thanh toán
// PUT /api/v1/admin/orders/:id/payment-status
// Body: { paymentStatus }
router.put("/admin/orders/:id/payment-status", checkLogin, checkAdmin, updatePaymentStatus);

// Cập nhật thông tin vận chuyển
// PUT /api/v1/admin/orders/:id/shipping
// Body: { carrier?, trackingNumber?, estimatedDeliveryDate? }
router.put("/admin/orders/:id/shipping", checkLogin, checkAdmin, updateShippingInfo);

// Xóa đơn hàng (admin)
// DELETE /api/v1/admin/orders/:id
router.delete("/admin/orders/:id", checkLogin, checkAdmin, deleteOrder);

// Lấy thông kê đơn hàng (admin)
// GET /api/v1/admin/order-report?startDate=2025/1/1&endDate=2025/2/1
router.get('/admin/orders-report', getOrderStatistics);

module.exports = router


/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         variantId:
 *           type: string
 *         productName:
 *           type: string
 *         color:
 *           type: string
 *         size:
 *           type: number
 *         price:
 *           type: number
 *         quantity:
 *           type: integer
 *         image:
 *           type: string
 *     
 *     Customer:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *     
 *     ShippingAddress:
 *       type: object
 *       properties:
 *         recipientName:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         ward:
 *           type: string
 *         district:
 *           type: string
 *         city:
 *           type: string
 *     
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *         userId:
 *           type: string
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         subtotal:
 *           type: number
 *         shippingFee:
 *           type: number
 *         discount:
 *           type: number
 *         voucherCode:
 *           type: string
 *         loyaltyPointsUsed:
 *           type: integer
 *         loyaltyPointsDiscount:
 *           type: number
 *         totalAmount:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cod, vnpay, momo]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipping, delivered, cancelled]
 *         shipping:
 *           type: object
 *           properties:
 *             carrier:
 *               type: string
 *             trackingNumber:
 *               type: string
 *             estimatedDeliveryDate:
 *               type: string
 *               format: date
 *         cancelReason:
 *           type: string
 *         note:
 *           type: string
 *         paidAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     description: Tạo đơn hàng mới (hỗ trợ cả guest checkout và user đã đăng nhập)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - shippingAddress
 *               - items
 *               - subtotal
 *               - totalAmount
 *               - paymentMethod
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID user (optional cho guest)
 *               customer:
 *                 $ref: '#/components/schemas/Customer'
 *               shippingAddress:
 *                 $ref: '#/components/schemas/ShippingAddress'
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               subtotal:
 *                 type: number
 *               shippingFee:
 *                 type: number
 *               discount:
 *                 type: number
 *               voucherCode:
 *                 type: string
 *               loyaltyPointsUsed:
 *                 type: integer
 *               loyaltyPointsDiscount:
 *                 type: number
 *               totalAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, vnpay, momo]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tạo đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Order created successfully
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/orders/number/{orderNumber}:
 *   get:
 *     summary: Lấy đơn hàng theo order number
 *     description: Tra cứu đơn hàng bằng số đơn hàng (dành cho guest tracking)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Số đơn hàng
 *     responses:
 *       200:
 *         description: Lấy đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Lấy đơn hàng theo ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Lấy đơn hàng thành công
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/orders/my-orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của user đăng nhập
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipping, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   put:
 *     summary: Hủy đơn hàng
 *     description: Hủy đơn hàng (chỉ áp dụng cho đơn pending/confirmed)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hủy đơn hàng thành công
 *       400:
 *         description: Không thể hủy đơn hàng ở trạng thái hiện tại
 *       403:
 *         description: Không có quyền hủy đơn hàng này
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: Lấy tất cả đơn hàng (Admin)
 *     tags: [Orders - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipping, delivered, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed]
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cod, vnpay, momo]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo orderNumber, tên, email, phone
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/orders/user/{userId}:
 *   get:
 *     summary: Lấy đơn hàng của một user cụ thể (Admin)
 *     tags: [Orders - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng (Admin)
 *     tags: [Orders - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipping, delivered, cancelled]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không thể cập nhật
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/orders/{id}/payment-status:
 *   put:
 *     summary: Cập nhật trạng thái thanh toán (Admin)
 *     tags: [Orders - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thanh toán thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/orders/{id}/shipping:
 *   put:
 *     summary: Cập nhật thông tin vận chuyển (Admin)
 *     tags: [Orders - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carrier:
 *                 type: string
 *                 description: Đơn vị vận chuyển
 *               trackingNumber:
 *                 type: string
 *                 description: Mã vận đơn
 *               estimatedDeliveryDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày giao hàng dự kiến
 *     responses:
 *       200:
 *         description: Cập nhật thông tin vận chuyển thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/orders/{id}:
 *   delete:
 *     summary: Xóa đơn hàng (Admin)
 *     tags: [Orders - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/orders-report:
 *   get:
 *     summary: Lấy thống kê đơn hàng (Admin)
 *     description: Lấy thống kê về đơn hàng và doanh thu
 *     tags: [Orders - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                       description: Tổng số đơn hàng
 *                     ordersByStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     ordersByPaymentStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     totalRevenue:
 *                       type: number
 *                       description: Tổng doanh thu
 *                     revenueByPaymentMethod:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           count:
 *                             type: integer
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */