const mongoose =require("mongoose");

const BrandSchema = mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'brands' });

const Brand = mongoose.model('brands', BrandSchema);

module.exports = Brand;

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
 *           example: 653a1c9a92ad3f5d1e4a7b12
 *         name:
 *           type: string
 *           description: Tên thương hiệu
 *           example: "Nike"
 *         slug:
 *           type: string
 *           description: Đường dẫn slug của thương hiệu
 *           example: "nike"
 *         logo:
 *           type: string
 *           description: URL logo của thương hiệu
 *           example: "https://example.com/uploads/nike-logo.png"
 *         description:
 *           type: string
 *           description: Mô tả ngắn về thương hiệu
 *           example: "Thương hiệu thể thao nổi tiếng toàn cầu"
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động của thương hiệu
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo thương hiệu
 *           example: 2025-10-16T08:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật thương hiệu
 *           example: 2025-10-16T09:00:00.000Z
 *       required:
 *         - name
 *         - slug
 */