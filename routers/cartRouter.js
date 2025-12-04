const express = require("express");
const router = express.Router();
const { cartController } = require("../controllers");
const { checkLogin } = require("../middlewares/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
  getCartCount
} = cartController;

// =============================================
// CART ROUTES
// =============================================

// Lấy giỏ hàng (hỗ trợ cả user đã login và guest với sessionId)
// GET /api/v1/cart?sessionId=xxx (cho guest)
// GET /api/v1/cart (cho user đã login)
router.get("/cart", getCart);

// Đếm số lượng items trong giỏ hàng
// GET /api/v1/cart/count?sessionId=xxx
router.get("/cart/count", getCartCount);

// Thêm sản phẩm vào giỏ hàng
// Body: { sessionId?, productId, variantId, quantity }
router.post("/cart/add", addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
// Body: { sessionId?, productId, variantId, quantity }
router.put("/cart/update", updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng
// Body: { sessionId?, productId, variantId }
router.delete("/cart/remove", removeFromCart);

// Xóa toàn bộ giỏ hàng
// Body: { sessionId? }
router.delete("/cart/clear", checkLogin, clearCart);

// Hợp nhất giỏ hàng (khi user đăng nhập)
// Body: { sessionId }
// Yêu cầu user đã đăng nhập
router.post("/cart/merge", checkLogin, mergeCart);

module.exports = router;



/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: ID của sản phẩm
 *         variantId:
 *           type: string
 *           description: ID của biến thể
 *         productName:
 *           type: string
 *           description: Tên sản phẩm
 *         color:
 *           type: string
 *           description: Màu sắc
 *         size:
 *           type: number
 *           description: Size giày
 *         price:
 *           type: number
 *           description: Giá sản phẩm
 *         quantity:
 *           type: integer
 *           description: Số lượng
 *         image:
 *           type: string
 *           description: Ảnh sản phẩm
 *       example:
 *         productId: "6123456789abcdef01234567"
 *         variantId: "6123456789abcdef01234568"
 *         productName: "Nike Air Max"
 *         color: "Đen"
 *         size: 42
 *         price: 2500000
 *         quantity: 2
 *         image: "https://cloudinary.com/..."
 *     
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của giỏ hàng
 *         userId:
 *           type: string
 *           description: ID của user (null nếu là guest)
 *         sessionId:
 *           type: string
 *           description: Session ID cho guest user
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalAmount:
 *           type: number
 *           description: Tổng tiền
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "6123456789abcdef01234569"
 *         userId: "6123456789abcdef01234560"
 *         sessionId: null
 *         items: []
 *         totalAmount: 5000000
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Lấy giỏ hàng
 *     description: Lấy giỏ hàng của user đã đăng nhập hoặc guest (sử dụng sessionId)
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session ID cho guest user (bắt buộc nếu chưa đăng nhập)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy giỏ hàng thành công
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
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Thiếu userId hoặc sessionId
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/cart/count:
 *   get:
 *     summary: Đếm số lượng items trong giỏ hàng
 *     description: Trả về tổng số lượng sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session ID cho guest user (bắt buộc nếu chưa đăng nhập)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đếm số lượng thành công
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
 *                     count:
 *                       type: integer
 *                       description: Tổng số lượng items
 *                       example: 5
 *       400:
 *         description: Thiếu userId hoặc sessionId
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/cart/add:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     description: Thêm sản phẩm mới hoặc tăng số lượng nếu đã tồn tại
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - variantId
 *               - quantity
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID cho guest user (bắt buộc nếu chưa đăng nhập)
 *               productId:
 *                 type: string
 *                 description: ID của sản phẩm
 *               variantId:
 *                 type: string
 *                 description: ID của biến thể sản phẩm
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Số lượng cần thêm
 *             example:
 *               sessionId: "abc123xyz"
 *               productId: "6123456789abcdef01234567"
 *               variantId: "6123456789abcdef01234568"
 *               quantity: 2
 *     responses:
 *       200:
 *         description: Thêm sản phẩm vào giỏ hàng thành công
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
 *                       example: Product added to cart successfully
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không đủ tồn kho
 *       404:
 *         description: Không tìm thấy sản phẩm hoặc variant
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/cart/update:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ hàng
 *     description: Thay đổi số lượng của một sản phẩm đã có trong giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - variantId
 *               - quantity
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID cho guest user (bắt buộc nếu chưa đăng nhập)
 *               productId:
 *                 type: string
 *                 description: ID của sản phẩm
 *               variantId:
 *                 type: string
 *                 description: ID của biến thể sản phẩm
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Số lượng mới
 *             example:
 *               sessionId: "abc123xyz"
 *               productId: "6123456789abcdef01234567"
 *               variantId: "6123456789abcdef01234568"
 *               quantity: 3
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *                       example: Cart item updated successfully
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không đủ tồn kho
 *       404:
 *         description: Không tìm thấy giỏ hàng, sản phẩm hoặc item trong giỏ hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/cart/remove:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     description: Xóa một sản phẩm cụ thể ra khỏi giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - variantId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID cho guest user (bắt buộc nếu chưa đăng nhập)
 *               productId:
 *                 type: string
 *                 description: ID của sản phẩm
 *               variantId:
 *                 type: string
 *                 description: ID của biến thể sản phẩm
 *             example:
 *               sessionId: "abc123xyz"
 *               productId: "6123456789abcdef01234567"
 *               variantId: "6123456789abcdef01234568"
 *     responses:
 *       200:
 *         description: Xóa sản phẩm thành công
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
 *                       example: Item removed from cart successfully
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Thiếu userId hoặc sessionId
 *       404:
 *         description: Không tìm thấy giỏ hàng hoặc item trong giỏ hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Xóa toàn bộ giỏ hàng
 *     description: Xóa tất cả sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID cho guest user (bắt buộc nếu chưa đăng nhập)
 *             example:
 *               sessionId: "abc123xyz"
 *     responses:
 *       200:
 *         description: Xóa giỏ hàng thành công
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
 *                       example: Cart cleared successfully
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Thiếu userId hoặc sessionId
 *       404:
 *         description: Không tìm thấy giỏ hàng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/cart/merge:
 *   post:
 *     summary: Hợp nhất giỏ hàng (khi user đăng nhập)
 *     description: Hợp nhất giỏ hàng của guest (sessionId) vào giỏ hàng của user đã đăng nhập
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID của giỏ hàng guest cần hợp nhất
 *             example:
 *               sessionId: "abc123xyz"
 *     responses:
 *       200:
 *         description: Hợp nhất giỏ hàng thành công
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
 *                       example: Cart merged successfully
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Thiếu sessionId
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
