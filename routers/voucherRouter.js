const express = require("express");
const router = express.Router();
const { voucherController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getAllVouchers,
  getAllVouchersAdmin,
  getVoucherById,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  updateVoucherStatus,
  validateVoucher,
  getVoucherStatistics
} = voucherController;

// =============================================
// PUBLIC ROUTES
// =============================================

// Lấy danh sách voucher đang hoạt động (public)
// GET /api/v1/vouchers?page=1&limit=20&search=xxx
router.get("/vouchers", getAllVouchers);

// Lấy voucher theo ID
// GET /api/v1/vouchers/:id
router.get("/vouchers/:id", getVoucherById);

// Lấy voucher theo code
// GET /api/v1/vouchers/code/:code
router.get("/vouchers/code/:code", getVoucherByCode);

// Validate voucher cho đơn hàng
// POST /api/v1/vouchers/validate
// Body: { code, orderTotal, productIds?, userId? }
router.post("/vouchers/validate", validateVoucher);

// =============================================
// ADMIN ROUTES
// =============================================

// Lấy tất cả voucher (admin)
// GET /api/v1/admin/vouchers?page=1&limit=20&isActive=true&search=xxx&sortBy=createdAt&order=desc
router.get("/admin/vouchers", checkLogin, checkAdmin, getAllVouchersAdmin);

// Tạo voucher mới
// POST /api/v1/admin/vouchers
// Body: { code, description, discountType, discountValue, maxDiscount?, minOrderValue?, maxUsage, maxUsagePerUser?, applicableProducts?, applicableCategories?, startDate, endDate }
router.post("/admin/vouchers", checkLogin, checkAdmin, createVoucher);

// Cập nhật voucher
// PUT /api/v1/admin/vouchers/:id
router.put("/admin/vouchers/:id", checkLogin, checkAdmin, updateVoucher);

// Xóa voucher
// DELETE /api/v1/admin/vouchers/:id
router.delete("/admin/vouchers/:id", checkLogin, checkAdmin, deleteVoucher);

// Cập nhật trạng thái voucher
// PUT /api/v1/admin/vouchers/:id/status
// Body: { isActive }
router.put("/admin/vouchers/:id/status", checkLogin, checkAdmin, updateVoucherStatus);

// Lấy thống kê voucher
// GET /api/v1/admin/vouchers/statistics?startDate=xxx&endDate=xxx
router.get("/admin/vouchers/statistics", checkLogin, checkAdmin, getVoucherStatistics);

module.exports = router;


// =============================================
// SWAGGER DOCUMENTATION
// =============================================

/**
 * @swagger
 * /api/v1/vouchers:
 *   get:
 *     summary: Lấy danh sách voucher đang hoạt động
 *     description: Lấy voucher còn hiệu lực và đang active (public)
 *     tags: [Vouchers]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy danh sách voucher thành công
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
 *                     vouchers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Voucher'
 *                     pagination:
 *                       type: object
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/vouchers/{id}:
 *   get:
 *     summary: Lấy voucher theo ID
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy voucher thành công
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/vouchers/code/{code}:
 *   get:
 *     summary: Lấy voucher theo code
 *     description: Kiểm tra thông tin và tính hợp lệ của voucher theo mã
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy voucher thành công
 *       400:
 *         description: Voucher hết hạn, không active hoặc đã hết lượt sử dụng
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/vouchers/validate:
 *   post:
 *     summary: Validate voucher cho đơn hàng
 *     description: Kiểm tra voucher có hợp lệ cho đơn hàng không và tính số tiền giảm
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderTotal
 *             properties:
 *               code:
 *                 type: string
 *                 description: Mã voucher
 *               orderTotal:
 *                 type: number
 *                 description: Tổng giá trị đơn hàng
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID sản phẩm trong đơn hàng
 *               userId:
 *                 type: string
 *                 description: ID user (để check usage per user)
 *     responses:
 *       200:
 *         description: Voucher hợp lệ
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
 *                     voucher:
 *                       type: object
 *                       properties:
 *                         code:
 *                           type: string
 *                         description:
 *                           type: string
 *                         discountType:
 *                           type: string
 *                         discountValue:
 *                           type: number
 *                         discountAmount:
 *                           type: number
 *                           description: Số tiền được giảm
 *       400:
 *         description: Voucher không hợp lệ
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/vouchers:
 *   get:
 *     summary: Lấy tất cả voucher (Admin)
 *     tags: [Vouchers - Admin]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Lấy danh sách voucher thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 *   post:
 *     summary: Tạo voucher mới (Admin)
 *     tags: [Vouchers - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - description
 *               - discountType
 *               - discountValue
 *               - maxUsage
 *               - startDate
 *               - endDate
 *             properties:
 *               code:
 *                 type: string
 *                 description: Mã voucher (sẽ tự động chuyển thành chữ hoa)
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [fixed, percentage]
 *               discountValue:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               minOrderValue:
 *                 type: number
 *               maxUsage:
 *                 type: integer
 *               maxUsagePerUser:
 *                 type: integer
 *               applicableProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicableCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Tạo voucher thành công
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
 * /api/v1/admin/vouchers/{id}:
 *   put:
 *     summary: Cập nhật voucher (Admin)
 *     tags: [Vouchers - Admin]
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
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [fixed, percentage]
 *               discountValue:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               minOrderValue:
 *                 type: number
 *               maxUsage:
 *                 type: integer
 *               maxUsagePerUser:
 *                 type: integer
 *               applicableProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicableCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật voucher thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa voucher (Admin)
 *     tags: [Vouchers - Admin]
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
 *         description: Xóa voucher thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/vouchers/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái voucher (Admin)
 *     tags: [Vouchers - Admin]
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Thiếu trường isActive
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/vouchers/statistics:
 *   get:
 *     summary: Lấy thống kê voucher (Admin)
 *     description: Lấy thống kê về voucher, usage và top voucher được sử dụng
 *     tags: [Vouchers - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                     totalVouchers:
 *                       type: integer
 *                       description: Tổng số voucher
 *                     activeVouchers:
 *                       type: integer
 *                       description: Số voucher đang active
 *                     expiredVouchers:
 *                       type: integer
 *                       description: Số voucher đã hết hạn
 *                     expiringVouchers:
 *                       type: integer
 *                       description: Số voucher sắp hết hạn (7 ngày)
 *                     totalUsageCount:
 *                       type: integer
 *                       description: Tổng số lần sử dụng
 *                     topUsedVouchers:
 *                       type: array
 *                       description: Top 10 voucher được dùng nhiều nhất
 *                       items:
 *                         type: object
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
