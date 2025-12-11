const mongoose =require("mongoose");

const ImageSchema = mongoose.Schema({
  url: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  alt: { type: String }
}, { _id: false });

const VariantSchema = mongoose.Schema({
  color: { type: String, required: true },
  colorCode: { type: String },
  size: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String, required: true }
}, { _id: true });

const SpecificationSchema = mongoose.Schema({
  material: { type: String },
  sole: { type: String },
  weight: { type: String },
  origin: { type: String },
  gender: { type: String, enum: ['male', 'female', 'unisex', 'kids'] }
}, { _id: false });

const SeoSchema = mongoose.Schema({
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }]
}, { _id: false });

const RatingSchema = mongoose.Schema({
  average: { type: Number, default: 0, min: 0, max: 5 },
  count: { type: Number, default: 0 }
}, { _id: false });

const ProductSchema = mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  shortDescription: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'brands', required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  costPrice: { type: Number },
  images: [ImageSchema],
  variants: [VariantSchema],
  specifications: SpecificationSchema,
  seo: SeoSchema,
  totalSold: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  rating: RatingSchema,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false }
}, { timestamps: true, collection: 'products' });

const Product = mongoose.model('products', ProductSchema);

module.exports = Product;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của sản phẩm
 *           example: 653a1c9a92ad3f5d1e4a7b12
 *         name:
 *           type: string
 *           description: Tên sản phẩm
 *           example: "Giày chạy bộ nam Nike Air Zoom Pegasus 40"
 *         slug:
 *           type: string
 *           description: Đường dẫn slug của sản phẩm
 *           example: "giay-chay-bo-nike-air-zoom-pegasus-40"
 *         sku:
 *           type: string
 *           description: Mã SKU của sản phẩm
 *           example: "NK-PEGASUS-40"
 *         description:
 *           type: string
 *           description: Mô tả chi tiết sản phẩm
 *           example: "Đôi giày được thiết kế dành cho vận động viên chạy bộ chuyên nghiệp..."
 *         shortDescription:
 *           type: string
 *           description: Mô tả ngắn gọn về sản phẩm
 *           example: "Giày chạy bộ thoáng khí và bền bỉ"
 *         categoryId:
 *           type: string
 *           description: ID danh mục chứa sản phẩm
 *           example: 653a1c9a92ad3f5d1e4a7b10
 *         brandId:
 *           type: string
 *           description: ID thương hiệu của sản phẩm
 *           example: 653a1c9a92ad3f5d1e4a7b13
 *         price:
 *           type: number
 *           description: Giá gốc của sản phẩm
 *           example: 2500000
 *         salePrice:
 *           type: number
 *           nullable: true
 *           description: Giá khuyến mãi (nếu có)
 *           example: 1990000
 *         costPrice:
 *           type: number
 *           description: Giá vốn của sản phẩm
 *           example: 1500000
 *         images:
 *           type: array
 *           description: Danh sách hình ảnh của sản phẩm
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://example.com/images/nike-pegasus-40-1.jpg"
 *               isPrimary:
 *                 type: boolean
 *                 example: true
 *               alt:
 *                 type: string
 *                 example: "Nike Pegasus 40 front view"
 *         variants:
 *           type: array
 *           description: Danh sách các biến thể của sản phẩm (size, màu, stock)
 *           items:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *                 example: "Đen"
 *               colorCode:
 *                 type: string
 *                 example: "#000000"
 *               size:
 *                 type: number
 *                 example: 42
 *               stock:
 *                 type: number
 *                 example: 25
 *               sku:
 *                 type: string
 *                 example: "NK-PEGASUS-40-BLACK-42"
 *         specifications:
 *           type: object
 *           description: Thông tin kỹ thuật của sản phẩm
 *           properties:
 *             material:
 *               type: string
 *               example: "Vải lưới tổng hợp"
 *             sole:
 *               type: string
 *               example: "Cao su chống trượt"
 *             weight:
 *               type: string
 *               example: "300g"
 *             origin:
 *               type: string
 *               example: "Việt Nam"
 *             gender:
 *               type: string
 *               enum: [male, female, unisex, kids]
 *               example: "male"
 *         seo:
 *           type: object
 *           description: Thông tin SEO cho sản phẩm
 *           properties:
 *             metaTitle:
 *               type: string
 *               example: "Giày chạy bộ Nike Pegasus 40 - Chính hãng"
 *             metaDescription:
 *               type: string
 *               example: "Mua giày chạy bộ Nike Pegasus 40 chính hãng, giá tốt tại Chung Shoe Store."
 *             metaKeywords:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["giày chạy bộ", "nike", "pegasus 40"]
 *         totalSold:
 *           type: number
 *           description: Tổng số lượng sản phẩm đã bán
 *           example: 320
 *         viewCount:
 *           type: number
 *           description: Số lượt xem sản phẩm
 *           example: 1250
 *         rating:
 *           type: object
 *           description: Đánh giá trung bình của sản phẩm
 *           properties:
 *             average:
 *               type: number
 *               example: 4.7
 *             count:
 *               type: number
 *               example: 230
 *         isActive:
 *           type: boolean
 *           description: Sản phẩm có đang được hiển thị hay không
 *           example: true
 *         isFeatured:
 *           type: boolean
 *           description: Sản phẩm nổi bật
 *           example: false
 *         isNew:
 *           type: boolean
 *           description: Sản phẩm mới
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-15T09:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-16T09:30:00.000Z
 *       required:
 *         - name
 *         - slug
 *         - sku
 *         - categoryId
 *         - brandId
 *         - price
 */
