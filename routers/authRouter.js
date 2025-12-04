const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const {
  forgotPassword,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyResetCode,
  refreshToken,
} = authController;
const { checkLogin } = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API quản lý xác thực người dùng
 */

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Create account successfully
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/signup", signUp);

/**
 * @swagger
 * /api/v1/signin:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Login successfully
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         description: Email hoặc mật khẩu không đúng
 *       500:
 *         description: Lỗi server
 */
router.post("/signin", signIn);

/**
 * @swagger
 * /api/v1/forgot-password:
 *   post:
 *     summary: Quên mật khẩu - Gửi mã xác thực qua email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Mã xác thực đã được gửi qua email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Reset password code has been sent to your email
 *                     email:
 *                       type: string
 *       404:
 *         description: Email không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/v1/verify-reset-code:
 *   post:
 *     summary: Xác thực mã reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Mã xác thực hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Reset code verified successfully
 *                     email:
 *                       type: string
 *       400:
 *         description: Mã xác thực không hợp lệ hoặc đã hết hạn
 *       404:
 *         description: Email không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/verify-reset-code", verifyResetCode);

/**
 * @swagger
 * /api/v1/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *                 description: Mật khẩu mới phải có ít nhất 6 ký tự
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password has been reset successfully
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc mã xác thực không đúng
 *       404:
 *         description: Email không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/v1/signout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Logout successfully
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.post("/signout", checkLogin, signOut);

/**
 * @swagger
 * /api/v1/me:
 *   get:
 *     summary: Lấy thông tin user hiện tại
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         role:
 *                           type: string
 *                         loyaltyPoints:
 *                           type: number
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.get("/me", checkLogin, getCurrentUser);


/**
 * @swagger
 * /api/v1/refresh-token:
 *   post:
 *     summary: Làm mới access token từ refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "your_refresh_token"
 *     responses:
 *       200:
 *         description: Access token mới
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: Thiếu refresh token
 *       401:
 *         description: Refresh token không hợp lệ hoặc hết hạn
 *       500:
 *         description: Lỗi server
 */
router.post("/refresh-token", refreshToken);

module.exports = router;
