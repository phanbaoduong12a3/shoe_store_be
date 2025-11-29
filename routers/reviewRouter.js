const express = require("express");
const router = express.Router();
const { reviewController } = require("../controllers");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const {
  getProductReviews,
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  replyReview,
  deleteReply,
  markHelpful,
  getUserReviews,
  getReviewStatistics,
  uploadReviewImages
} = reviewController;

// =============================================
// PUBLIC ROUTES
// =============================================

// Lấy danh sách review của sản phẩm (đã duyệt)
// GET /api/v1/reviews/product/:productId?page=1&limit=10&rating=5&sortBy=createdAt&order=desc
router.get("/reviews/product/:productId", getProductReviews);

// Lấy review theo ID
// GET /api/v1/reviews/:id
router.get("/reviews/:id", getReviewById);

// Đánh dấu review hữu ích
// PUT /api/v1/reviews/:id/helpful
router.put("/reviews/:id/helpful", markHelpful);

// =============================================
// USER ROUTES (yêu cầu đăng nhập)
// =============================================

// Lấy review của user đăng nhập
// GET /api/v1/reviews/my-reviews?page=1&limit=10
router.get("/reviews/my-reviews", checkLogin, getUserReviews);

// Tạo review mới (có thể upload ảnh)
// POST /api/v1/reviews
// Body: { productId, orderId, rating, comment }
// Form-data: images (optional, max 5 files)
router.post("/reviews", checkLogin, uploadReviewImages, createReview);

// Cập nhật review của mình
// PUT /api/v1/reviews/:id
// Body: { rating?, comment? }
router.put("/reviews/:id", checkLogin, updateReview);

// Xóa review của mình
// DELETE /api/v1/reviews/:id
router.delete("/reviews/:id", checkLogin, deleteReview);

// =============================================
// ADMIN ROUTES
// =============================================

// Lấy tất cả review (admin)
// GET /api/v1/admin/reviews?page=1&limit=20&isApproved=false&rating=5&productId=xxx&search=xxx
router.get("/admin/reviews", checkLogin, checkAdmin, getAllReviews);

// Lấy review của một user cụ thể (admin)
// GET /api/v1/admin/reviews/user/:userId?page=1&limit=10
router.get("/admin/reviews/user/:userId", checkLogin, checkAdmin, getUserReviews);

// Duyệt/từ chối review
// PUT /api/v1/admin/reviews/:id/approve
// Body: { isApproved }
router.put("/admin/reviews/:id/approve", checkLogin, checkAdmin, approveReview);

// Trả lời review
// POST /api/v1/admin/reviews/:id/reply
// Body: { content }
router.post("/admin/reviews/:id/reply", checkLogin, checkAdmin, replyReview);

// Xóa trả lời review
// DELETE /api/v1/admin/reviews/:id/reply
router.delete("/admin/reviews/:id/reply", checkLogin, checkAdmin, deleteReply);

// Lấy thống kê review
// GET /api/v1/admin/reviews/statistics?startDate=xxx&endDate=xxx
router.get("/admin/reviews/statistics", checkLogin, checkAdmin, getReviewStatistics);


module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         productId:
 *           type: string
 *         userId:
 *           type: string
 *         orderId:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         reviewer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             avatar:
 *               type: string
 *         isVerifiedPurchase:
 *           type: boolean
 *         isApproved:
 *           type: boolean
 *         helpfulCount:
 *           type: integer
 *         reply:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             repliedBy:
 *               type: string
 *             repliedAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/reviews/product/{productId}:
 *   get:
 *     summary: Lấy danh sách review của sản phẩm
 *     description: Lấy tất cả review đã được duyệt của sản phẩm cùng thống kê rating
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Lọc theo số sao
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
 *         description: Lấy danh sách review thành công
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
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *                     pagination:
 *                       type: object
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalReviews:
 *                           type: integer
 *                         avgRating:
 *                           type: number
 *                         ratingDistribution:
 *                           type: array
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: Lấy review theo ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy review thành công
 *       404:
 *         description: Không tìm thấy review
 *       500:
 *         description: Lỗi server
 *   put:
 *     summary: Cập nhật review của mình
 *     tags: [Reviews]
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật review thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền cập nhật review này
 *       404:
 *         description: Không tìm thấy review
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa review của mình
 *     tags: [Reviews]
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
 *         description: Xóa review thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xóa review này
 *       404:
 *         description: Không tìm thấy review
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/reviews/{id}/helpful:
 *   put:
 *     summary: Đánh dấu review hữu ích
 *     description: Tăng số lượt đánh dấu hữu ích của review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
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
 *                     helpfulCount:
 *                       type: integer
 *       404:
 *         description: Không tìm thấy review
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/reviews/my-reviews:
 *   get:
 *     summary: Lấy review của user đăng nhập
 *     tags: [Reviews]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Lấy danh sách review thành công
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Tạo review mới
 *     description: Tạo review cho sản phẩm đã mua (chỉ đơn hàng đã delivered)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - orderId
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *               orderId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Tối đa 5 ảnh (jpg, jpeg, png, gif, webp - max 5MB mỗi ảnh)
 *     responses:
 *       200:
 *         description: Tạo review thành công
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
 *                       example: Review created successfully. It will be visible after approval.
 *                     review:
 *                       $ref: '#/components/schemas/Review'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc đã review sản phẩm này
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền review đơn hàng này
 *       404:
 *         description: Không tìm thấy đơn hàng hoặc user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/reviews:
 *   get:
 *     summary: Lấy tất cả review (Admin)
 *     tags: [Reviews - Admin]
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
 *         name: isApproved
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *       - in: query
 *         name: productId
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
 *         description: Lấy danh sách review thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/reviews/user/{userId}:
 *   get:
 *     summary: Lấy review của một user cụ thể (Admin)
 *     tags: [Reviews - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Lấy danh sách review thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/reviews/{id}/approve:
 *   put:
 *     summary: Duyệt/từ chối review (Admin)
 *     tags: [Reviews - Admin]
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
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái duyệt thành công
 *       400:
 *         description: Thiếu trường isApproved
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy review
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/reviews/{id}/reply:
 *   post:
 *     summary: Trả lời review (Admin)
 *     tags: [Reviews - Admin]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung trả lời
 *     responses:
 *       200:
 *         description: Trả lời review thành công
 *       400:
 *         description: Thiếu nội dung trả lời
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy review
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa trả lời review (Admin)
 *     tags: [Reviews - Admin]
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
 *         description: Xóa trả lời thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy review hoặc reply
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/reviews/statistics:
 *   get:
 *     summary: Lấy thống kê review (Admin)
 *     description: Lấy thống kê về review, rating và sản phẩm được review nhiều
 *     tags: [Reviews - Admin]
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
 *                     totalReviews:
 *                       type: integer
 *                     approvedReviews:
 *                       type: integer
 *                     pendingReviews:
 *                       type: integer
 *                     avgRating:
 *                       type: number
 *                     ratingDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: integer
 *                           count:
 *                             type: integer
 *                     topReviewedProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                           reviewCount:
 *                             type: integer
 *                           avgRating:
 *                             type: number
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
