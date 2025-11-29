const mongoose =require("mongoose");

const CartItemSchema = mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productName: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
}, { _id: false });

const CartSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
  sessionId: { type: String },
  items: [CartItemSchema],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true, collection: 'carts' });

const Cart = mongoose.model('carts', CartSchema);

module.exports = Cart;

/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 653a1c9a92ad3f5d1e4a7b12
 *         userId:
 *           type: string
 *           nullable: true
 *           description: ID người dùng (null nếu chưa đăng nhập)
 *           example: 653a1c9a92ad3f5d1e4a7b00
 *         sessionId:
 *           type: string
 *           description: Mã session của người dùng chưa đăng nhập
 *           example: "session_abc123"
 *         items:
 *           type: array
 *           description: Danh sách sản phẩm trong giỏ hàng
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm
 *                 example: 653a1c9a92ad3f5d1e4a7b77
 *               variantId:
 *                 type: string
 *                 description: ID biến thể sản phẩm
 *                 example: 653a1c9a92ad3f5d1e4a7b88
 *               productName:
 *                 type: string
 *                 description: Tên sản phẩm
 *                 example: "Áo thun nam cổ tròn"
 *               color:
 *                 type: string
 *                 description: Màu sắc sản phẩm
 *                 example: "Đen"
 *               size:
 *                 type: number
 *                 description: Kích thước sản phẩm
 *                 example: 42
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *                 example: 299000
 *               quantity:
 *                 type: integer
 *                 description: Số lượng sản phẩm
 *                 example: 2
 *               image:
 *                 type: string
 *                 description: Hình ảnh sản phẩm
 *                 example: "https://example.com/images/shirt-black.jpg"
 *         totalAmount:
 *           type: number
 *           description: Tổng tiền của giỏ hàng
 *           example: 598000
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm tạo giỏ hàng
 *           example: 2025-10-16T08:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm cập nhật giỏ hàng
 *           example: 2025-10-16T09:00:00.000Z
 *       required:
 *         - items
 */
