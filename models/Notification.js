const mongoose =require("mongoose");

const NotificationSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  type: { type: String, enum: ['order_status', 'promotion', 'stock_alert'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true, collection: 'notifications' });

const Notification = mongoose.model('notifications', NotificationSchema);

module.exports = Notification;

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - title
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của thông báo
 *         userId:
 *           type: string
 *           description: ID của người nhận thông báo
 *         type:
 *           type: string
 *           enum: [order_status, promotion, stock_alert]
 *           example: "order_status"
 *           description: Loại thông báo
 *         title:
 *           type: string
 *           example: "Đơn hàng của bạn đã được giao"
 *           description: Tiêu đề ngắn gọn của thông báo
 *         message:
 *           type: string
 *           example: "Đơn hàng #ORD20251016001 của bạn đã được giao thành công!"
 *           description: Nội dung chi tiết thông báo
 *         relatedId:
 *           type: string
 *           nullable: true
 *           description: ID đơn hàng hoặc sản phẩm...
 *         relatedModel:
 *           type: string
 *           nullable: true
 *           example: "orders"
 *           description: Tên collection liên quan
 *         isRead:
 *           type: boolean
 *           default: false
 *           description: Trạng thái đã đọc của thông báo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-16T09:30:00.000Z"
 *           description: Ngày tạo thông báo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-16T09:45:00.000Z"
 *           description: Ngày cập nhật thông báo
 */
