const express = require("express");
const router = express.Router();
const { blogController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getAllBlogs,
  getAllBlogsAdmin,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  updateBlogThumbnail,
  togglePublishBlog,
  getRelatedBlogs,
  getPopularBlogs,
  getLatestBlogs,
  getAllTags,
  getBlogsByAuthor,
  getBlogStatistics,
  uploadBlogThumbnail
} = blogController;

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: API quản lý blog/bài viết
 */

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Lấy danh sách bài viết (đã publish)
 *     tags: [Blogs]
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
 *           default: 12
 *         description: Số bài viết mỗi trang
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Lọc theo category ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Lọc theo tag
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo title, excerpt, content
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: publishedAt
 *         description: Sắp xếp theo trường
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs", getAllBlogs);

/**
 * @swagger
 * /api/v1/blogs/popular:
 *   get:
 *     summary: Lấy danh sách bài viết phổ biến (lượt xem cao)
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Số lượng bài viết
 *     responses:
 *       200:
 *         description: Danh sách bài viết phổ biến
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/popular", getPopularBlogs);

/**
 * @swagger
 * /api/v1/blogs/latest:
 *   get:
 *     summary: Lấy danh sách bài viết mới nhất
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Số lượng bài viết
 *     responses:
 *       200:
 *         description: Danh sách bài viết mới nhất
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/latest", getLatestBlogs);

/**
 * @swagger
 * /api/v1/blogs/tags:
 *   get:
 *     summary: Lấy danh sách tất cả tags
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Danh sách tags và số lượng bài viết
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/tags", getAllTags);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   get:
 *     summary: Lấy bài viết theo ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Thông tin bài viết
 *       403:
 *         description: Bài viết chưa được publish
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/:id", getBlogById);

/**
 * @swagger
 * /api/v1/blogs/slug/{slug}:
 *   get:
 *     summary: Lấy bài viết theo slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog slug
 *     responses:
 *       200:
 *         description: Thông tin bài viết
 *       403:
 *         description: Bài viết chưa được publish
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/slug/:slug", getBlogBySlug);

/**
 * @swagger
 * /api/v1/blogs/{id}/related:
 *   get:
 *     summary: Lấy bài viết liên quan
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         description: Số lượng bài viết liên quan
 *     responses:
 *       200:
 *         description: Danh sách bài viết liên quan
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/:id/related", getRelatedBlogs);

/**
 * @swagger
 * /api/v1/blogs/author/{authorId}:
 *   get:
 *     summary: Lấy bài viết của tác giả
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách bài viết của tác giả
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/author/:authorId", getBlogsByAuthor);

/**
 * @swagger
 * /api/v1/admin/blogs:
 *   get:
 *     summary: Admin - Lấy tất cả bài viết (bao gồm draft)
 *     tags: [Blogs]
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
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái publish
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
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
 *         description: Danh sách bài viết
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get("/admin/blogs", checkLogin, checkAdmin, getAllBlogsAdmin);

/**
 * @swagger
 * /api/v1/admin/blogs:
 *   post:
 *     summary: Admin - Tạo bài viết mới
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài viết
 *               slug:
 *                 type: string
 *                 description: Slug (unique)
 *               content:
 *                 type: string
 *                 description: Nội dung bài viết (HTML/Markdown)
 *               excerpt:
 *                 type: string
 *                 description: Mô tả ngắn
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách tags
 *               seo:
 *                 type: object
 *                 description: SEO metadata
 *               isPublished:
 *                 type: boolean
 *                 default: false
 *                 description: Trạng thái publish
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh thumbnail (max 5MB)
 *     responses:
 *       200:
 *         description: Tạo bài viết thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Category không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/admin/blogs", checkLogin, checkAdmin, uploadBlogThumbnail, createBlog);

/**
 * @swagger
 * /api/v1/admin/blogs/{id}:
 *   put:
 *     summary: Admin - Cập nhật bài viết
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               seo:
 *                 type: object
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.put("/admin/blogs/:id", checkLogin, checkAdmin, updateBlog);

/**
 * @swagger
 * /api/v1/admin/blogs/{id}:
 *   delete:
 *     summary: Admin - Xóa bài viết
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.delete("/admin/blogs/:id", checkLogin, checkAdmin, deleteBlog);

/**
 * @swagger
 * /api/v1/admin/blogs/{id}/thumbnail:
 *   put:
 *     summary: Admin - Cập nhật thumbnail bài viết
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - thumbnail
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh thumbnail mới (max 5MB)
 *     responses:
 *       200:
 *         description: Cập nhật thumbnail thành công
 *       400:
 *         description: Chưa upload file
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.put("/admin/blogs/:id/thumbnail", checkLogin, checkAdmin, uploadBlogThumbnail, updateBlogThumbnail);

/**
 * @swagger
 * /api/v1/admin/blogs/{id}/publish:
 *   put:
 *     summary: Admin - Publish/Unpublish bài viết
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPublished
 *             properties:
 *               isPublished:
 *                 type: boolean
 *                 description: true để publish, false để unpublish
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái publish thành công
 *       400:
 *         description: Thiếu isPublished
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.put("/admin/blogs/:id/publish", checkLogin, checkAdmin, togglePublishBlog);

/**
 * @swagger
 * /api/v1/admin/blogs/statistics:
 *   get:
 *     summary: Admin - Lấy thống kê blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc
 *     responses:
 *       200:
 *         description: Thống kê blog (tổng số, published, draft, views, top viewed, by category, top authors)
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get("/admin/blogs/statistics", checkLogin, checkAdmin, getBlogStatistics);


module.exports = router;
