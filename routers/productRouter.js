const express = require("express");
const router = express.Router();
const { productController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadImages,
  deleteImage,
  setPrimaryImage,
  getRelatedProducts,
  uploadProductImages
} = productController;

// =============================================
// PUBLIC ROUTES
// =============================================

// Lấy danh sách sản phẩm với filter, search, pagination
// GET /api/v1/products?page=1&limit=20&categoryId=xxx&brandId=xxx&search=xxx&minPrice=100&maxPrice=1000&gender=male&sortBy=price&order=asc
router.get("/products", getAllProducts);

// Lấy sản phẩm theo ID
// GET /api/v1/products/:id
router.get("/products/:id", getProductById);

// Lấy sản phẩm theo slug
// GET /api/v1/products/slug/:slug
router.get("/products/slug/:slug", getProductBySlug);

// Lấy sản phẩm liên quan
// GET /api/v1/products/:id/related?limit=8
router.get("/products/:id/related", getRelatedProducts);

// =============================================
// ADMIN ROUTES
// =============================================

// Tạo sản phẩm mới
// POST /api/v1/admin/products
// Body: { name, slug, sku, description, shortDescription, categoryId, brandId, price, salePrice?, costPrice?, images?, variants?, specifications?, seo?, isFeatured?, isNew? }
router.post("/admin/products", checkLogin, checkAdmin, createProduct);

// Cập nhật sản phẩm
// PUT /api/v1/admin/products/:id
router.put("/admin/products/:id", checkLogin, checkAdmin, updateProduct);

// Xóa sản phẩm
// DELETE /api/v1/admin/products/:id
router.delete("/admin/products/:id", checkLogin, checkAdmin, deleteProduct);

// Cập nhật trạng thái sản phẩm
// PUT /api/v1/admin/products/:id/status
// Body: { isActive }
router.put("/admin/products/:id/status", checkLogin, checkAdmin, updateProductStatus);

// =============================================
// VARIANT MANAGEMENT (ADMIN)
// =============================================

// Thêm variant mới cho sản phẩm
// POST /api/v1/admin/products/:id/variants
// Body: { color, colorCode?, size, stock?, sku }
router.post("/admin/products/:id/variants", checkLogin, checkAdmin, addVariant);

// Cập nhật variant
// PUT /api/v1/admin/products/:id/variants/:variantId
// Body: { color?, colorCode?, size?, stock?, sku? }
router.put("/admin/products/:id/variants/:variantId", checkLogin, checkAdmin, updateVariant);

// Xóa variant
// DELETE /api/v1/admin/products/:id/variants/:variantId
router.delete("/admin/products/:id/variants/:variantId", checkLogin, checkAdmin, deleteVariant);

// =============================================
// IMAGE MANAGEMENT (ADMIN)
// =============================================

// Upload hình ảnh cho sản phẩm
// POST /api/v1/admin/products/:id/images
// Form-data: images (multiple files, max 10)
router.post("/admin/products/:id/images", checkLogin, checkAdmin, uploadProductImages, uploadImages);

// Xóa hình ảnh
// DELETE /api/v1/admin/products/:id/images
// Body: { imageUrl }
router.delete("/admin/products/:id/images", checkLogin, checkAdmin, deleteImage);

// Set hình ảnh chính
// PUT /api/v1/admin/products/:id/images/primary
// Body: { imageUrl }
router.put("/admin/products/:id/images/primary", checkLogin, checkAdmin, setPrimaryImage);


module.exports = router;


// =============================================
// SWAGGER DOCUMENTATION
// =============================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Product ID
 *         name:
 *           type: string
 *           description: Tên sản phẩm
 *         slug:
 *           type: string
 *           description: Slug của sản phẩm
 *         sku:
 *           type: string
 *           description: Mã SKU sản phẩm
 *         description:
 *           type: string
 *           description: Mô tả chi tiết sản phẩm
 *         shortDescription:
 *           type: string
 *           description: Mô tả ngắn
 *         categoryId:
 *           type: object
 *           description: Danh mục sản phẩm
 *         brandId:
 *           type: object
 *           description: Thương hiệu sản phẩm
 *         price:
 *           type: number
 *           description: Giá gốc
 *         salePrice:
 *           type: number
 *           description: Giá khuyến mãi
 *         costPrice:
 *           type: number
 *           description: Giá vốn
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *               alt:
 *                 type: string
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *               colorCode:
 *                 type: string
 *               size:
 *                 type: string
 *               stock:
 *                 type: number
 *               sku:
 *                 type: string
 *         specifications:
 *           type: object
 *           description: Thông số kỹ thuật
 *         seo:
 *           type: object
 *           description: SEO metadata
 *         isFeatured:
 *           type: boolean
 *           description: Sản phẩm nổi bật
 *         isNew:
 *           type: boolean
 *           description: Sản phẩm mới
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động
 *         viewCount:
 *           type: number
 *           description: Số lượt xem
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *         - sku
 *         - categoryId
 *         - brandId
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         sku:
 *           type: string
 *         description:
 *           type: string
 *         shortDescription:
 *           type: string
 *         categoryId:
 *           type: string
 *         brandId:
 *           type: string
 *         price:
 *           type: number
 *         salePrice:
 *           type: number
 *         costPrice:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: object
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *         specifications:
 *           type: object
 *         seo:
 *           type: object
 *         isFeatured:
 *           type: boolean
 *         isNew:
 *           type: boolean
 * 
 *     VariantInput:
 *       type: object
 *       required:
 *         - color
 *         - size
 *         - sku
 *       properties:
 *         color:
 *           type: string
 *           description: Màu sắc
 *         colorCode:
 *           type: string
 *           description: Mã màu (hex)
 *         size:
 *           type: string
 *           description: Kích thước
 *         stock:
 *           type: number
 *           description: Số lượng tồn kho
 *         sku:
 *           type: string
 *           description: Mã SKU của variant
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Products - Public ( Khách chưa đăng nhập )]
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
 *         description: Số sản phẩm mỗi trang
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Lọc theo thương hiệu
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên, mô tả, SKU
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Giá tối thiểu
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Giá tối đa
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, unisex]
 *         description: Lọc theo giới tính
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sắp xếp theo trường (price, name, createdAt, viewCount)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Lọc sản phẩm nổi bật
 *       - in: query
 *         name: isNew
 *         schema:
 *           type: boolean
 *         description: Lọc sản phẩm mới
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
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
 * /api/v1/products/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm theo ID
 *     tags: [Products - Public ( Khách chưa đăng nhập )]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/products/slug/{slug}:
 *   get:
 *     summary: Lấy sản phẩm theo slug
 *     tags: [Products - Public ( Khách chưa đăng nhập )]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product slug
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/products/{id}/related:
 *   get:
 *     summary: Lấy sản phẩm liên quan
 *     tags: [Products - Public ( Khách chưa đăng nhập )]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Số lượng sản phẩm liên quan
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm liên quan
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/products:
 *   post:
 *     summary: Tạo sản phẩm mới (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Tạo sản phẩm thành công
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
 *                       example: Product created successfully
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy category hoặc brand
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
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
 *                       example: Product updated successfully
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa sản phẩm (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Xóa thành công
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
 *                       example: Product deleted successfully
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/products/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái sản phẩm (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
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
 *                 description: Trạng thái hoạt động
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
 *                       example: Product status updated successfully
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/products/{id}/variants:
 *   post:
 *     summary: Thêm variant cho sản phẩm (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VariantInput'
 *     responses:
 *       200:
 *         description: Thêm variant thành công
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
 *                       example: Variant added successfully
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc SKU đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/products/{id}/variants/{variantId}:
 *   put:
 *     summary: Cập nhật variant (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *               colorCode:
 *                 type: string
 *               size:
 *                 type: string
 *               stock:
 *                 type: number
 *               sku:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật variant thành công
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
 *                       example: Variant updated successfully
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc SKU đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm hoặc variant
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa variant (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Xóa variant thành công
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
 *                       example: Variant deleted successfully
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/products/{id}/images:
 *   post:
 *     summary: Upload hình ảnh cho sản phẩm (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Danh sách hình ảnh (tối đa 10 file, mỗi file tối đa 5MB)
 *     responses:
 *       200:
 *         description: Upload thành công
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
 *                       example: Images uploaded successfully
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           isPrimary:
 *                             type: boolean
 *                           alt:
 *                             type: string
 *       400:
 *         description: Không có file upload
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa hình ảnh sản phẩm (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL của hình ảnh cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
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
 *                       example: Image deleted successfully
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Thiếu imageUrl
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm hoặc hình ảnh
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/products/{id}/images/primary:
 *   put:
 *     summary: Đặt hình ảnh chính cho sản phẩm (Admin)
 *     tags: [Products - Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL của hình ảnh cần set làm primary
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
 *                       example: Primary image set successfully
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Thiếu imageUrl
 *       401:
 *         description: Chưa cập nhật thành coong
 *  
 * */