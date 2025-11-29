const mongoose =require("mongoose");

const VoucherSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['fixed', 'percentage'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number },
  minOrderValue: { type: Number, default: 0 },
  maxUsage: { type: Number, required: true },
  usageCount: { type: Number, default: 0 },
  maxUsagePerUser: { type: Number, default: 1 },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'vouchers' });

const Voucher = mongoose.model('vouchers', VoucherSchema);

module.exports = Voucher;

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Voucher:
 *       type: object
 *       required:
 *         - code
 *         - description
 *         - discountType
 *         - discountValue
 *         - maxUsage
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của voucher (tự động tạo bởi MongoDB)
 *           example: "6530a9a2a4b8cf3c1b23a456"
 *         code:
 *           type: string
 *           description: Mã voucher duy nhất
 *           example: "SALE20"
 *         description:
 *           type: string
 *           description: Mô tả chi tiết của voucher
 *           example: "Giảm 20% cho tất cả sản phẩm trong tháng 10"
 *         discountType:
 *           type: string
 *           enum: [fixed, percentage]
 *           description: Loại giảm giá (cố định hoặc phần trăm)
 *           example: "percentage"
 *         discountValue:
 *           type: number
 *           description: Giá trị giảm (nếu là percentage thì tính theo %)
 *           example: 20
 *         maxDiscount:
 *           type: number
 *           description: Số tiền giảm tối đa (nếu discountType là percentage)
 *           example: 100000
 *         minOrderValue:
 *           type: number
 *           description: Giá trị đơn hàng tối thiểu để áp dụng voucher
 *           example: 200000
 *         maxUsage:
 *           type: number
 *           description: Tổng số lần voucher được sử dụng cho toàn hệ thống
 *           example: 500
 *         usageCount:
 *           type: number
 *           description: Số lần voucher đã được sử dụng
 *           example: 120
 *         maxUsagePerUser:
 *           type: number
 *           description: Số lần tối đa mỗi người dùng có thể sử dụng voucher này
 *           example: 1
 *         applicableProducts:
 *           type: array
 *           description: Danh sách ID sản phẩm áp dụng voucher
 *           items:
 *             type: string
 *             example: "652c7a92b1d8ad87f8b12c3d"
 *         applicableCategories:
 *           type: array
 *           description: Danh sách ID danh mục áp dụng voucher
 *           items:
 *             type: string
 *             example: "652c8b12d2e9ad88f9b45a1c"
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Ngày bắt đầu hiệu lực của voucher
 *           example: "2025-10-01T00:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Ngày hết hạn của voucher
 *           example: "2025-10-31T23:59:59.000Z"
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động của voucher
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo voucher
 *           example: "2025-10-10T09:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật voucher gần nhất
 *           example: "2025-10-12T15:30:00.000Z"
 */
