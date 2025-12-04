const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getUserById,
  updateAddress,
  updateAvatar,
  uploadAvatar,
  updateProfile,
  changePassword,
  addAddress,
  updateUserRole,
  deleteAddress,
  toggleWishlist,
  getWishlist,
  getAllUsers,
  deleteUser,
  getCurrentUser,
} = userController;

router.get("/me", checkLogin, getCurrentUser);
// User routes
router.get("/profile/:id", checkLogin, getUserById);
router.put("/profile", checkLogin, updateProfile);
router.put("/avatar", checkLogin, uploadAvatar, updateAvatar);
router.put("/change-password", checkLogin, changePassword);

// Address routes
router.post("/addresses", checkLogin, addAddress);
router.put("/addresses/:addressId", checkLogin, updateAddress);
router.delete("/addresses/:addressId", checkLogin, deleteAddress);

// Wishlist routes
router.post("/wishlist", checkLogin, toggleWishlist);
router.get("/wishlist", checkLogin, getWishlist);

// Admin routes
router.get("/admin/users", checkLogin, checkAdmin, getAllUsers);
router.put("/admin/users/:id/role", checkLogin, checkAdmin, updateUserRole);
router.delete("/admin/users/:id", checkLogin, checkAdmin, deleteUser);

module.exports = router;

// =============================================
// SWAGGER DOCUMENTATION
// =============================================

/**
 * @swagger
 * /api/v1/profile/{id}:
 *   get:
 *     summary: Lấy thông tin user theo ID
 *     tags: [Users]
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
 *         description: Lấy thông tin user thành công
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/profile:
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc số điện thoại đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/avatar:
 *   put:
 *     summary: Cập nhật ảnh đại diện
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh đại diện (jpg, jpeg, png, gif, webp - max 5MB)
 *     responses:
 *       200:
 *         description: Cập nhật avatar thành công
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
 *                     avatar:
 *                       type: string
 *       400:
 *         description: Chưa upload ảnh
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu hiện tại không đúng hoặc mật khẩu mới quá ngắn
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Thêm địa chỉ mới
 *     tags: [Users - Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientName
 *               - phone
 *               - address
 *               - ward
 *               - district
 *               - city
 *             properties:
 *               recipientName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               ward:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Thêm địa chỉ thành công
 *       400:
 *         description: Thiếu thông tin địa chỉ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   put:
 *     summary: Cập nhật địa chỉ
 *     tags: [Users - Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               ward:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật địa chỉ thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user hoặc địa chỉ
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa địa chỉ
 *     tags: [Users - Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa địa chỉ thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Lấy danh sách wishlist
 *     tags: [Users - Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy wishlist thành công
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
 *                     wishlist:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 *   post:
 *     summary: Thêm/xóa sản phẩm vào wishlist
 *     description: Toggle sản phẩm trong wishlist (thêm nếu chưa có, xóa nếu đã có)
 *     tags: [Users - Wishlist]
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
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thêm/xóa sản phẩm thành công
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
 *                     wishlist:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Thiếu product ID
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Lấy danh sách tất cả user (Admin)
 *     tags: [Users - Admin]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, staff, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên, email, phone
 *     responses:
 *       200:
 *         description: Lấy danh sách user thành công
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   put:
 *     summary: Cập nhật role của user (Admin)
 *     tags: [Users - Admin]
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, staff, admin]
 *     responses:
 *       200:
 *         description: Cập nhật role thành công
 *       400:
 *         description: Role không hợp lệ hoặc không thể thay đổi role của chính mình
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Xóa user (Admin)
 *     tags: [Users - Admin]
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
 *         description: Xóa user thành công
 *       400:
 *         description: Không thể xóa tài khoản của chính mình
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */
