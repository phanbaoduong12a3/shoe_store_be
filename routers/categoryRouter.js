const express = require("express");
const router = express.Router();
const { categoryController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getRootCategories,
  getSubCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryImage,
  uploadCategoryImage
} = categoryController;

// =============================================
// PUBLIC ROUTES
// =============================================

// Lấy tất cả danh mục (có thể lọc theo isActive, parentId)
// GET /api/categories?isActive=true&parentId=xxx
router.get("/categories", getAllCategories);

// Lấy danh mục gốc (không có parent)
// GET /api/categories/root
router.get("/categories/root", getRootCategories);

// Lấy danh mục con theo parent ID
// GET /api/categories/sub/:parentId
router.get("/categories/sub/:parentId", getSubCategories);

// Lấy danh mục theo ID
// GET /api/categories/:id
router.get("/categories/:id", getCategoryById);

// Lấy danh mục theo slug
// GET /api/categories/slug/:slug
router.get("/categories/slug/:slug", getCategoryBySlug);

// =============================================
// ADMIN ROUTES
// =============================================

// Tạo danh mục mới (có thể upload image)
// POST /api/v1/admin/categories
router.post("/admin/categories", checkLogin, checkAdmin, uploadCategoryImage, createCategory);

// Cập nhật danh mục
// PUT /api/v1/admin/categories/:id
router.put("/admin/categories/:id", checkLogin, checkAdmin, updateCategory);

// Xóa danh mục
// DELETE /api/v1/admin/categories/:id
router.delete("/admin/categories/:id", checkLogin, checkAdmin, deleteCategory);

// Cập nhật hình ảnh danh mục
// PUT /api/v1/admin/categories/:id/image
router.put("/admin/categories/:id/image", checkLogin, checkAdmin, uploadCategoryImage, updateCategoryImage);


module.exports = router;



/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của danh mục
 *         name:
 *           type: string
 *           description: Tên danh mục
 *         slug:
 *           type: string
 *           description: Slug của danh mục
 *         description:
 *           type: string
 *           description: Mô tả danh mục
 *         image:
 *           type: string
 *           description: URL hình ảnh danh mục
 *         parentId:
 *           type: string
 *           description: ID danh mục cha (null nếu là danh mục gốc)
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động
 *         displayOrder:
 *           type: integer
 *           description: Thứ tự hiển thị
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "6123456789abcdef01234567"
 *         name: "Giày thể thao"
 *         slug: "giay-the-thao"
 *         description: "Danh mục giày thể thao cao cấp"
 *         image: "https://cloudinary.com/..."
 *         parentId: null
 *         isActive: true
 *         displayOrder: 1
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục
 *     description: Lấy tất cả danh mục với các tùy chọn lọc theo trạng thái và parent
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Lọc theo ID danh mục cha (dùng 'null' để lấy danh mục gốc)
 *     responses:
 *       200:
 *         description: Lấy danh sách danh mục thành công
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/categories/root:
 *   get:
 *     summary: Lấy danh mục gốc
 *     description: Lấy tất cả danh mục không có parent (danh mục cấp cao nhất)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lấy danh mục gốc thành công
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/categories/sub/{parentId}:
 *   get:
 *     summary: Lấy danh mục con theo parent ID
 *     description: Lấy tất cả danh mục con của một danh mục cha cụ thể
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục cha
 *     responses:
 *       200:
 *         description: Lấy danh mục con thành công
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Lấy danh mục theo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *     responses:
 *       200:
 *         description: Lấy danh mục thành công
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
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Lấy danh mục theo slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của danh mục
 *     responses:
 *       200:
 *         description: Lấy danh mục thành công
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
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/categories:
 *   post:
 *     summary: Tạo danh mục mới (Admin)
 *     tags: [Categories - Admin]
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
 *                 description: Tên danh mục
 *               slug:
 *                 type: string
 *                 description: Slug của danh mục
 *               description:
 *                 type: string
 *                 description: Mô tả danh mục
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Hình ảnh danh mục (jpg, jpeg, png, gif, webp - max 5MB)
 *               parentId:
 *                 type: string
 *                 description: ID danh mục cha (để tạo danh mục con)
 *               isActive:
 *                 type: boolean
 *                 description: Trạng thái hoạt động
 *               displayOrder:
 *                 type: integer
 *                 description: Thứ tự hiển thị
 *     responses:
 *       200:
 *         description: Tạo danh mục thành công
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
 *                       example: Category created successfully
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc slug đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy danh mục cha
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   put:
 *     summary: Cập nhật danh mục (Admin)
 *     tags: [Categories - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên danh mục
 *               slug:
 *                 type: string
 *                 description: Slug của danh mục
 *               description:
 *                 type: string
 *                 description: Mô tả danh mục
 *               image:
 *                 type: string
 *                 description: URL hình ảnh
 *               parentId:
 *                 type: string
 *                 description: ID danh mục cha
 *               isActive:
 *                 type: boolean
 *                 description: Trạng thái hoạt động
 *               displayOrder:
 *                 type: integer
 *                 description: Thứ tự hiển thị
 *     responses:
 *       200:
 *         description: Cập nhật danh mục thành công
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
 *                       example: Category updated successfully
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc danh mục không thể là cha của chính nó
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy danh mục hoặc danh mục cha
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa danh mục (Admin)
 *     tags: [Categories - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *     responses:
 *       200:
 *         description: Xóa danh mục thành công
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
 *                       example: Category deleted successfully
 *       400:
 *         description: Không thể xóa danh mục có danh mục con hoặc sản phẩm
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/categories/{id}/image:
 *   put:
 *     summary: Cập nhật hình ảnh danh mục (Admin)
 *     tags: [Categories - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Hình ảnh mới (jpg, jpeg, png, gif, webp - max 5MB)
 *     responses:
 *       200:
 *         description: Cập nhật hình ảnh thành công
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
 *                       example: Category image updated successfully
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         description: Chưa upload hình ảnh
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Lỗi server
 */
