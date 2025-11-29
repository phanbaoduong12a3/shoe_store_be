const mongoose =require("mongoose");

const BlogSeoSchema = mongoose.Schema({
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }]
}, { _id: false });

const BlogSchema = mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  thumbnail: { type: String },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
  tags: [{ type: String }],
  seo: BlogSeoSchema,
  viewCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date }
}, { timestamps: true, collection: 'blogs' });

const Blog = mongoose.model('blogs', BlogSchema);

module.exports = Blog;

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của bài viết blog
 *           example: 653a1c9a92ad3f5d1e4a7b12
 *         title:
 *           type: string
 *           description: Tiêu đề bài viết
 *           example: "Cách chọn giày thể thao phù hợp cho từng hoạt động"
 *         slug:
 *           type: string
 *           description: Đường dẫn slug của bài viết
 *           example: "cach-chon-giay-the-thao-phu-hop"
 *         content:
 *           type: string
 *           description: Nội dung chi tiết của bài viết
 *           example: "<p>Giày thể thao phù hợp giúp bạn thoải mái hơn khi vận động...</p>"
 *         excerpt:
 *           type: string
 *           description: Tóm tắt ngắn gọn nội dung bài viết
 *           example: "Mẹo chọn giày thể thao phù hợp với từng loại hình vận động."
 *         thumbnail:
 *           type: string
 *           description: Ảnh thumbnail đại diện cho bài viết
 *           example: "https://example.com/uploads/blog-thumbnail.jpg"
 *         authorId:
 *           type: string
 *           description: ID của tác giả bài viết
 *           example: 653a1c9a92ad3f5d1e4a7b13
 *         categoryId:
 *           type: string
 *           description: ID danh mục của bài viết
 *           example: 653a1c9a92ad3f5d1e4a7b10
 *         tags:
 *           type: array
 *           description: Danh sách các thẻ (tags) của bài viết
 *           items:
 *             type: string
 *           example: ["giày thể thao", "chạy bộ", "mẹo chọn giày"]
 *         seo:
 *           type: object
 *           description: Thông tin SEO cho bài viết
 *           properties:
 *             metaTitle:
 *               type: string
 *               example: "Cách chọn giày thể thao - Blog Chung Shoe Store"
 *             metaDescription:
 *               type: string
 *               example: "Hướng dẫn chi tiết cách chọn giày thể thao phù hợp cho từng hoạt động."
 *             metaKeywords:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["giày thể thao", "hướng dẫn chọn giày"]
 *         viewCount:
 *           type: number
 *           description: Số lượt xem bài viết
 *           example: 128
 *         isPublished:
 *           type: boolean
 *           description: Trạng thái xuất bản của bài viết
 *           example: true
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày xuất bản bài viết
 *           example: 2025-10-16T08:30:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo bài viết
 *           example: 2025-10-15T09:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật bài viết
 *           example: 2025-10-16T09:30:00.000Z
 *       required:
 *         - title
 *         - slug
 *         - content
 *         - authorId
 */
