const mongoose =require("mongoose");

const CustomerSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });

const ShippingAddressSchema = mongoose.Schema({
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  ward: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true }
}, { _id: false });

const OrderItemSchema = mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
  image: { type: String }
}, { _id: false });

const StatusHistorySchema = mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const ShippingSchema = mongoose.Schema({
  carrier: { type: String, enum: ['GHN', 'GHTK', 'ViettelPost', 'Other'] },
  trackingNumber: { type: String },
  estimatedDeliveryDate: { type: Date }
}, { _id: false });

const OrderSchema = mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
  customer: CustomerSchema,
  shippingAddress: ShippingAddressSchema,
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  voucherCode: { type: String },
  loyaltyPointsUsed: { type: Number, default: 0 },
  loyaltyPointsDiscount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'momo', 'zalopay', 'banking'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paidAt: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  statusHistory: [StatusHistorySchema],
  shipping: ShippingSchema,
  note: { type: String },
  cancelReason: { type: String }
}, { timestamps: true, collection: 'orders' });

const Order = mongoose.model('orders', OrderSchema);

module.exports = Order;

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - orderNumber
 *         - items
 *         - subtotal
 *         - totalAmount
 *         - paymentMethod
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của đơn hàng
 *         orderNumber:
 *           type: string
 *           example: "ORD20251016001"
 *           description: Mã đơn hàng duy nhất
 *         userId:
 *           type: string
 *           nullable: true
 *           description: ID người dùng nếu có (khách hàng đăng nhập)
 *         customer:
 *           type: object
 *           description: Thông tin khách hàng (ẩn, không tách riêng schema)
 *           properties:
 *             name:
 *               type: string
 *               example: "Nguyễn Văn A"
 *             email:
 *               type: string
 *               example: "vana@gmail.com"
 *             phone:
 *               type: string
 *               example: "0901234567"
 *         shippingAddress:
 *           type: object
 *           description: Địa chỉ giao hàng
 *           properties:
 *             recipientName:
 *               type: string
 *               example: "Nguyễn Văn A"
 *             phone:
 *               type: string
 *               example: "0901234567"
 *             address:
 *               type: string
 *               example: "123 Đường Lê Lợi"
 *             ward:
 *               type: string
 *               example: "Phường 7"
 *             district:
 *               type: string
 *               example: "Quận 3"
 *             city:
 *               type: string
 *               example: "TP. Hồ Chí Minh"
 *         items:
 *           type: array
 *           description: Danh sách sản phẩm trong đơn hàng
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm
 *               variantId:
 *                 type: string
 *                 description: ID biến thể
 *               productName:
 *                 type: string
 *                 example: "Giày Nike Air Force 1"
 *               sku:
 *                 type: string
 *                 example: "NIKE-AF1-42"
 *               color:
 *                 type: string
 *                 example: "Trắng"
 *               size:
 *                 type: number
 *                 example: 42
 *               price:
 *                 type: number
 *                 example: 2500000
 *               quantity:
 *                 type: number
 *                 example: 2
 *               subtotal:
 *                 type: number
 *                 example: 5000000
 *               image:
 *                 type: string
 *                 example: "https://example.com/uploads/af1.png"
 *         subtotal:
 *           type: number
 *           example: 5000000
 *         shippingFee:
 *           type: number
 *           example: 30000
 *         discount:
 *           type: number
 *           example: 100000
 *         voucherCode:
 *           type: string
 *           example: "SALE20"
 *         loyaltyPointsUsed:
 *           type: number
 *           example: 200
 *         loyaltyPointsDiscount:
 *           type: number
 *           example: 20000
 *         totalAmount:
 *           type: number
 *           example: 4910000
 *         paymentMethod:
 *           type: string
 *           enum: [cod, momo, zalopay, banking]
 *           example: "momo"
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 *           default: pending
 *         paidAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipping, delivered, cancelled]
 *           default: pending
 *           example: "processing"
 *         statusHistory:
 *           type: array
 *           description: Lịch sử thay đổi trạng thái đơn hàng
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "confirmed"
 *               note:
 *                 type: string
 *                 example: "Xác nhận đơn hàng thành công"
 *               updatedBy:
 *                 type: string
 *                 description: ID người cập nhật
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-16T09:30:00.000Z"
 *         shipping:
 *           type: object
 *           description: Thông tin vận chuyển
 *           properties:
 *             carrier:
 *               type: string
 *               enum: [GHN, GHTK, ViettelPost, Other]
 *               example: "GHN"
 *             trackingNumber:
 *               type: string
 *               example: "GHN123456789VN"
 *             estimatedDeliveryDate:
 *               type: string
 *               format: date-time
 *               example: "2025-10-20T00:00:00.000Z"
 *         note:
 *           type: string
 *           example: "Giao hàng trong giờ hành chính"
 *         cancelReason:
 *           type: string
 *           example: "Khách hủy đơn"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo đơn
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật đơn
 */
