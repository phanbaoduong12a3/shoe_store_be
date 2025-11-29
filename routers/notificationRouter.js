const express = require("express");
const router = express.Router();
const { notificationController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getUserNotifications,
  getAllNotifications,
  getNotificationById,
  createNotification,
  createBulkNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationStatistics
} = notificationController;

// =============================================
// USER ROUTES (yêu cầu đăng nhập)
// =============================================

// Lấy danh sách thông báo của user
// GET /api/notifications?page=1&limit=20&isRead=false&type=order_status
router.get("/notifications", checkLogin, getUserNotifications);

// Đếm số thông báo chưa đọc
// GET /api/notifications/unread-count
router.get("/notifications/unread-count", checkLogin, getUnreadCount);

// Lấy thông báo theo ID
// GET /api/notifications/:id
router.get("/notifications/:id", checkLogin, getNotificationById);

// Đánh dấu một thông báo đã đọc
// PUT /api/notifications/:id/read
router.put("/notifications/:id/read", checkLogin, markAsRead);

// Đánh dấu tất cả thông báo đã đọc
// PUT /api/notifications/mark-all-read
router.put("/notifications/mark-all-read", checkLogin, markAllAsRead);

// Xóa một thông báo
// DELETE /api/notifications/:id
router.delete("/notifications/:id", checkLogin, deleteNotification);

// Xóa tất cả thông báo đã đọc
// DELETE /api/notifications/read
router.delete("/notifications/read", checkLogin, deleteReadNotifications);

// Xóa tất cả thông báo của user
// DELETE /api/notifications/all
router.delete("/notifications/all", checkLogin, deleteAllNotifications);

// =============================================
// ADMIN ROUTES
// =============================================

// Lấy tất cả thông báo (admin)
// GET /api/admin/notifications?page=1&limit=20&userId=xxx&isRead=false&type=order_status
router.get("/admin/notifications", checkLogin, checkAdmin, getAllNotifications);

// Tạo thông báo mới cho một user
// POST /api/admin/notifications
// Body: { userId, type, title, message, relatedId?, relatedModel? }
router.post("/admin/notifications", checkLogin, checkAdmin, createNotification);

// Tạo thông báo cho nhiều user
// POST /api/admin/notifications/bulk
// Body: { userIds[], type, title, message, relatedId?, relatedModel? }
router.post("/admin/notifications/bulk", checkLogin, checkAdmin, createBulkNotifications);

// Lấy thống kê thông báo
// GET /api/admin/notifications/statistics?startDate=xxx&endDate=xxx
router.get("/admin/notifications/statistics", checkLogin, checkAdmin, getNotificationStatistics);

module.exports = router



/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của thông báo
 *         userId:
 *           type: string
 *           description: ID của user nhận thông báo
 *         type:
 *           type: string
 *           enum: [order_status, promotion, stock_alert]
 *           description: Loại thông báo
 *         title:
 *           type: string
 *           description: Tiêu đề thông báo
 *         message:
 *           type: string
 *           description: Nội dung thông báo
 *         relatedId:
 *           type: string
 *           description: ID của đối tượng liên quan (order, product...)
 *         relatedModel:
 *           type: string
 *           description: Tên model liên quan (Order, Product...)
 *         isRead:
 *           type: boolean
 *           description: Trạng thái đã đọc
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "6123456789abcdef01234567"
 *         userId: "6123456789abcdef01234560"
 *         type: "order_status"
 *         title: "Đơn hàng đã được giao"
 *         message: "Đơn hàng #12345 của bạn đã được giao thành công"
 *         relatedId: "6123456789abcdef01234561"
 *         relatedModel: "Order"
 *         isRead: false
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo của user
 *     description: Lấy danh sách thông báo của user hiện tại đã đăng nhập
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng thông báo mỗi trang
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái đã đọc
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [order_status, promotion, stock_alert]
 *         description: Lọc theo loại thông báo
 *     responses:
 *       200:
 *         description: Lấy danh sách thông báo thành công
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                     unreadCount:
 *                       type: integer
 *                       description: Số thông báo chưa đọc
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Đếm số thông báo chưa đọc
 *     description: Trả về số lượng thông báo chưa đọc của user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đếm số thông báo chưa đọc thành công
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
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Lấy thông báo theo ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Lấy thông báo thành công
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
 *                     notification:
 *                       $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem thông báo này
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa một thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Xóa thông báo thành công
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
 *                       example: Notification deleted successfully
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xóa thông báo này
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Đánh dấu một thông báo đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Đánh dấu đã đọc thành công
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
 *                       example: Notification marked as read
 *                     notification:
 *                       $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền cập nhật thông báo này
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Đánh dấu tất cả thông báo đã đọc
 *     description: Đánh dấu tất cả thông báo chưa đọc của user thành đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đánh dấu tất cả thành công
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
 *                       example: All notifications marked as read
 *                     modifiedCount:
 *                       type: integer
 *                       description: Số thông báo đã được cập nhật
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/notifications/read:
 *   delete:
 *     summary: Xóa tất cả thông báo đã đọc
 *     description: Xóa tất cả thông báo đã đọc của user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa thông báo đã đọc thành công
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
 *                       example: Read notifications deleted successfully
 *                     deletedCount:
 *                       type: integer
 *                       description: Số thông báo đã xóa
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/notifications/all:
 *   delete:
 *     summary: Xóa tất cả thông báo của user
 *     description: Xóa toàn bộ thông báo của user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa tất cả thông báo thành công
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
 *                       example: All notifications deleted successfully
 *                     deletedCount:
 *                       type: integer
 *                       description: Số thông báo đã xóa
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Lấy tất cả thông báo (Admin)
 *     description: Lấy danh sách tất cả thông báo với các tùy chọn lọc
 *     tags: [Notifications - Admin]
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
 *         name: userId
 *         schema:
 *           type: string
 *         description: Lọc theo user ID
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [order_status, promotion, stock_alert]
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
 *         description: Lấy danh sách thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 *   post:
 *     summary: Tạo thông báo mới cho một user (Admin)
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của user nhận thông báo
 *               type:
 *                 type: string
 *                 enum: [order_status, promotion, stock_alert]
 *                 description: Loại thông báo
 *               title:
 *                 type: string
 *                 description: Tiêu đề thông báo
 *               message:
 *                 type: string
 *                 description: Nội dung thông báo
 *               relatedId:
 *                 type: string
 *                 description: ID đối tượng liên quan (optional)
 *               relatedModel:
 *                 type: string
 *                 description: Tên model liên quan (optional)
 *     responses:
 *       200:
 *         description: Tạo thông báo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/notifications/bulk:
 *   post:
 *     summary: Tạo thông báo cho nhiều user (Admin)
 *     description: Tạo cùng một thông báo cho nhiều user cùng lúc
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID của users nhận thông báo
 *               type:
 *                 type: string
 *                 enum: [order_status, promotion, stock_alert]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               relatedId:
 *                 type: string
 *               relatedModel:
 *                 type: string
 *             example:
 *               userIds: ["6123456789abcdef01234560", "6123456789abcdef01234561"]
 *               type: "promotion"
 *               title: "Khuyến mãi đặc biệt"
 *               message: "Giảm giá 50% cho tất cả sản phẩm"
 *     responses:
 *       200:
 *         description: Tạo thông báo hàng loạt thành công
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
 *                       example: Bulk notifications created successfully
 *                     count:
 *                       type: integer
 *                       description: Số thông báo đã tạo
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/notifications/statistics:
 *   get:
 *     summary: Lấy thống kê thông báo (Admin)
 *     description: Lấy thống kê về thông báo theo loại, thời gian
 *     tags: [Notifications - Admin]
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
 *                     totalNotifications:
 *                       type: integer
 *                       description: Tổng số thông báo
 *                     readNotifications:
 *                       type: integer
 *                       description: Số thông báo đã đọc
 *                     unreadNotifications:
 *                       type: integer
 *                       description: Số thông báo chưa đọc
 *                     notificationsByType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     notificationsByDay:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

