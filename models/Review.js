const mongoose =require("mongoose");

const ReviewerSchema = mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String }
}, { _id: false });

const ReplySchema = mongoose.Schema({
  content: { type: String, required: true },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  repliedAt: { type: Date, default: Date.now }
}, { _id: false });

const ReviewSchema = mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  reviewer: ReviewerSchema,
  reply: ReplySchema,
  isVerifiedPurchase: { type: Boolean, default: true },
  helpfulCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true, collection: 'reviews' });

const Review = mongoose.model('reviews', ReviewSchema);

module.exports = Review;


/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - productId
 *         - userId
 *         - orderId
 *         - rating
 *         - comment
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của đánh giá
 *         productId:
 *           type: string
 *           description: ID của sản phẩm được đánh giá
 *         userId:
 *           type: string
 *           description: ID của người dùng thực hiện đánh giá
 *         orderId:
 *           type: string
 *           description: ID của đơn hàng chứa sản phẩm
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *           description: Số sao đánh giá
 *         comment:
 *           type: string
 *           example: "Giày đẹp, đi êm chân!"
 *           description: Nội dung đánh giá
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             example: "https://example.com/uploads/review1.jpg"
 *           description: Danh sách hình ảnh đính kèm
 *         reviewer:
 *           type: object
 *           description: Thông tin người đánh giá (ẩn, không tách riêng schema)
 *           properties:
 *             name:
 *               type: string
 *               example: "Nguyễn Văn A"
 *             avatar:
 *               type: string
 *               example: "https://example.com/avatar.png"
 *         reply:
 *           type: object
 *           description: Phản hồi của admin hoặc cửa hàng
 *           properties:
 *             content:
 *               type: string
 *               example: "Cảm ơn bạn đã đánh giá!"
 *             repliedBy:
 *               type: string
 *               description: ID của người phản hồi
 *             repliedAt:
 *               type: string
 *               format: date-time
 *               example: "2025-10-16T09:30:00.000Z"
 *         isVerifiedPurchase:
 *           type: boolean
 *           default: true
 *           description: Xác nhận người dùng đã mua sản phẩm
 *         helpfulCount:
 *           type: number
 *           default: 0
 *           description: Số lượng người thấy đánh giá này hữu ích
 *         isApproved:
 *           type: boolean
 *           default: false
 *           description: Đánh giá đã được duyệt hay chưa
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật
 */
