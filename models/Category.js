const mongoose =require("mongoose");

const CategorySchema = mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', default: null },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true, collection: 'categories' });

const Category = mongoose.model('categories', CategorySchema);

module.exports = Category;

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 652f3aab4c8f7c7d34a2c1e1
 *         name:
 *           type: string
 *           description: Tên danh mục
 *           example: Electronics
 *         slug:
 *           type: string
 *           description: Đường dẫn thân thiện (unique)
 *           example: electronics
 *         description:
 *           type: string
 *           description: Mô tả danh mục
 *           example: All kinds of electronic devices and accessories
 *         image:
 *           type: string
 *           description: URL hình ảnh đại diện
 *           example: https://example.com/images/electronics.jpg
 *         parentId:
 *           type: string
 *           nullable: true
 *           description: ID danh mục cha (null nếu là danh mục gốc)
 *           example: null
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động
 *           example: true
 *         displayOrder:
 *           type: integer
 *           description: Thứ tự hiển thị
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm tạo
 *           example: 2025-10-16T08:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm cập nhật
 *           example: 2025-10-16T09:00:00.000Z
 *       required:
 *         - name
 *         - slug
 */
