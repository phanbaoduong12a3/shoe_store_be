const express = require("express");
const router = express.Router();
const { brandController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getAllBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  updateBrandLogo,
  toggleBrandStatus,
  getActiveBrands,
  uploadBrandLogo
} = brandController;

// =============================================
// PUBLIC ROUTES
// =============================================

// Lấy danh sách tất cả thương hiệu (có phân trang, tìm kiếm, lọc)
router.get("/brands", getAllBrands);

// Lấy danh sách thương hiệu đang hoạt động
router.get("/brands/active", getActiveBrands);

// Lấy thương hiệu theo ID
router.get("/brands/:id", getBrandById);

// Lấy thương hiệu theo slug
router.get("/brands/slug/:slug", getBrandBySlug);

// =============================================
// ADMIN ROUTES
// =============================================

// Tạo thương hiệu mới (có thể upload logo)
router.post("/admin/brands", checkLogin, checkAdmin, uploadBrandLogo, createBrand);

// Cập nhật thông tin thương hiệu
router.put("/admin/brands/:id", checkLogin, checkAdmin,uploadBrandLogo, updateBrand);

// Xóa thương hiệu
router.delete("/admin/brands/:id", checkLogin, checkAdmin, deleteBrand);

// Cập nhật logo thương hiệu
router.put("/admin/brands/:id/logo", checkLogin, checkAdmin, uploadBrandLogo, updateBrandLogo);

// Bật/tắt trạng thái thương hiệu
router.put("/admin/brands/:id/status", checkLogin, checkAdmin, toggleBrandStatus);


module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của thương hiệu
 *         name:
 *           type: string
 *           description: Tên thương hiệu
 *         slug:
 *           type: string
 *           description: Slug của thương hiệu
 *         logo:
 *           type: string
 *           description: URL logo của thương hiệu
 *         description:
 *           type: string
 *           description: Mô tả thương hiệu
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "6123456789abcdef01234567"
 *         name: "Nike"
 *         slug: "nike"
 *         logo: "https://cloudinary.com/..."
 *         description: "Thương hiệu giày thể thao hàng đầu"
 *         isActive: true
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Lấy danh sách tất cả thương hiệu
 *     tags: [Brands]
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
 *         description: Số lượng thương hiệu mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên hoặc mô tả
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *         description: Sắp xếp theo trường
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Lấy danh sách thương hiệu thành công
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
 *                     brands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
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
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/brands/active:
 *   get:
 *     summary: Lấy danh sách thương hiệu đang hoạt động
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Lấy danh sách thương hiệu hoạt động thành công
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
 *                     brands:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           logo:
 *                             type: string
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Lấy thương hiệu theo ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thương hiệu
 *     responses:
 *       200:
 *         description: Lấy thương hiệu thành công
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
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Không tìm thấy thương hiệu
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/brands/slug/{slug}:
 *   get:
 *     summary: Lấy thương hiệu theo slug
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của thương hiệu
 *     responses:
 *       200:
 *         description: Lấy thương hiệu thành công
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
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Không tìm thấy thương hiệu
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/brands:
 *   post:
 *     summary: Tạo thương hiệu mới (Admin)
 *     tags: [Brands - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên thương hiệu
 *               slug:
 *                 type: string
 *                 description: Slug của thương hiệu
 *               description:
 *                 type: string
 *                 description: Mô tả thương hiệu
 *               isActive:
 *                 type: boolean
 *                 description: Trạng thái hoạt động
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: File logo (jpg, jpeg, png, svg, webp - max 2MB)
 *     responses:
 *       201:
 *         description: Tạo thương hiệu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Brand created successfully
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc slug đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/brands/{id}:
 *   put:
 *     summary: Cập nhật thông tin thương hiệu (Admin)
 *     tags: [Brands - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thương hiệu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thương hiệu thành công
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
 *                       example: Brand updated successfully
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Slug đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy thương hiệu
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa thương hiệu (Admin)
 *     tags: [Brands - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thương hiệu
 *     responses:
 *       200:
 *         description: Xóa thương hiệu thành công
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
 *                       example: Brand deleted successfully
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy thương hiệu
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/brands/{id}/logo:
 *   put:
 *     summary: Cập nhật logo thương hiệu (Admin)
 *     tags: [Brands - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thương hiệu
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: File logo mới (jpg, jpeg, png, svg, webp - max 2MB)
 *     responses:
 *       200:
 *         description: Cập nhật logo thành công
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
 *                       example: Brand logo updated successfully
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Chưa upload file logo
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy thương hiệu
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/brands/{id}/status:
 *   put:
 *     summary: Bật/tắt trạng thái thương hiệu (Admin)
 *     tags: [Brands - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thương hiệu
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
 *                 description: Trạng thái mới
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
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
 *                       example: Brand activated successfully
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Thiếu trường isActive
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy thương hiệu
 *       500:
 *         description: Lỗi server
 */
