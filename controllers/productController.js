const { Product, Category, Brand } = require('../models');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cấu hình Multer với Cloudinary Storage cho product images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoe-store/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware upload product images
exports.uploadProductImages = upload.array('images', 10);

// =============================================
// LẤY DANH SÁCH SẢN PHẨM (PUBLIC)
// =============================================
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      categoryId, 
      brandId, 
      search, 
      minPrice, 
      maxPrice,
      gender,
      sortBy = 'createdAt',
      order = 'desc',
      isFeatured,
      isNew
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (categoryId) query.categoryId = categoryId;
    if (brandId) query.brandId = brandId;
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isNew) query.isNew = isNew === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (gender) {
      query['specifications.gender'] = gender;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllProducts Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY CHI TIẾT SẢN PHẨM THEO ID
// =============================================
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId)
      .populate('categoryId', 'name slug description')
      .populate('brandId', 'name slug logo description');

    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Tăng view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { product } 
    });
  } catch (error) {
    console.error('GetProductById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY SẢN PHẨM THEO SLUG
// =============================================
exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const product = await Product.findOne({ slug, isActive: true })
      .populate('categoryId', 'name slug description')
      .populate('brandId', 'name slug logo description');

    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Tăng view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { product } 
    });
  } catch (error) {
    console.error('GetProductBySlug Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: TẠO SẢN PHẨM MỚI
// =============================================
exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      slug,
      sku,
      description,
      shortDescription,
      categoryId,
      brandId,
      price,
      salePrice,
      costPrice,
      variants,
      specifications,
      seo,
      isFeatured,
      isNew
    } = req?.body;

    // Convert multipart string -> JSON
    if (variants && typeof variants === "string") {
      variants = JSON.parse(variants);
    }
    if (specifications && typeof specifications === "string") {
      specifications = JSON.parse(specifications);
    }
    if (seo && typeof seo === "string") {
      seo = JSON.parse(seo);
    }

    const images = req?.files?.map(file => file.path) || [];


    // Validate input
    if (!name || !slug || !sku || !categoryId || !brandId || !price) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Name, slug, sku, categoryId, brandId and price are required' } 
      });
    }

    // Kiểm tra slug đã tồn tại
    const checkSlug = await Product.findOne({ slug });
    if (checkSlug) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Slug is already in use' } 
      });
    }

    // Kiểm tra SKU đã tồn tại
    const checkSku = await Product.findOne({ sku });
    if (checkSku) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'SKU is already in use' } 
      });
    }

    // Kiểm tra category tồn tại
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Category not found' } 
      });
    }

    // Kiểm tra brand tồn tại
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Brand not found' } 
      });
    }

    // Tạo product mới
    const newProduct = await Product.create({
      name,
      slug,
      sku,
      description,
      shortDescription,
      categoryId,
      brandId,
      price,
      salePrice,
      costPrice,
      images: images || [],
      variants: variants || [],
      specifications: specifications || {},
      seo: seo || {},
      isFeatured: isFeatured || false,
      isNew: isNew || false
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Product created successfully',
        product: newProduct
      } 
    });
  } catch (error) {
    console.error('CreateProduct Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT SẢN PHẨM
// =============================================
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Kiểm tra product tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Kiểm tra slug nếu có thay đổi
    if (updateData.slug && updateData.slug !== product.slug) {
      const checkSlug = await Product.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: productId } 
      });
      if (checkSlug) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Slug is already in use' } 
        });
      }
    }

    // Kiểm tra SKU nếu có thay đổi
    if (updateData.sku && updateData.sku !== product.sku) {
      const checkSku = await Product.findOne({ 
        sku: updateData.sku, 
        _id: { $ne: productId } 
      });
      if (checkSku) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'SKU is already in use' } 
        });
      }
    }

    // Kiểm tra category nếu có thay đổi
    if (updateData.categoryId && updateData.categoryId !== product.categoryId.toString()) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(404).json({ 
          status: 404, 
          data: { message: 'Category not found' } 
        });
      }
    }

    // Kiểm tra brand nếu có thay đổi
    if (updateData.brandId && updateData.brandId !== product.brandId.toString()) {
      const brand = await Brand.findById(updateData.brandId);
      if (!brand) {
        return res.status(404).json({ 
          status: 404, 
          data: { message: 'Brand not found' } 
        });
      }
    }

    if (updateData.variants && typeof updateData.variants === "string") {
      updateData.variants = JSON.parse(updateData.variants);
    }
    if (updateData.specifications && typeof updateData.specifications === "string") {
      updateData.specifications = JSON.parse(updateData.specifications);
    }
    if (updateData.seo && typeof updateData.seo === "string") {
      updateData.seo = JSON.parse(updateData.seo);
    }

    const images = req?.files?.map(file => file.path) || [];

    // Cập nhật product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name slug')
     .populate('brandId', 'name slug logo');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Cập nhật sản phẩm thành công',
        product: updatedProduct
      } 
    });
  } catch (error) {
    console.error('UpdateProduct Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA SẢN PHẨM
// =============================================
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Xóa images trên cloudinary
    if (deletedProduct.images && deletedProduct.images.length > 0) {
      for (const image of deletedProduct.images) {
        try {
          const publicId = image.url.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(`shoe-store/products/${publicId}`);
        } catch (err) {
          console.log('Error deleting image:', err);
        }
      }
    }

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Product deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteProduct Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT TRẠNG THÁI SẢN PHẨM
// =============================================
exports.updateProductStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const { isActive, isNew, isFeatured } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        isActive,
        isNew,
        isFeatured,
      },
      { new: true }
    );


    if (!updatedProduct) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Cập nhật trạng thái sản phẩm thành công',
        product: updatedProduct
      } 
    });
  } catch (error) {
    console.error('UpdateProductStatus Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Có lỗi xảy ra!' } 
    });
  }
};

// =============================================
// ADMIN: THÊM VARIANT CHO SẢN PHẨM
// =============================================
exports.addVariant = async (req, res) => {
  try {
    const productId = req.params.id;
    const { color, colorCode, size, stock, sku } = req.body;

    // Validate input
    if (!color || !size || !sku) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Color, size and sku are required' } 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Kiểm tra variant SKU đã tồn tại
    const checkSku = await Product.findOne({ 'variants.sku': sku });
    if (checkSku) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Variant SKU is already in use' } 
      });
    }

    // Thêm variant mới
    product.variants.push({
      color,
      colorCode,
      size,
      stock: stock || 0,
      sku
    });

    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Variant added successfully',
        variants: product.variants
      } 
    });
  } catch (error) {
    console.error('AddVariant Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT VARIANT
// =============================================
exports.updateVariant = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.params.variantId;
    const { color, colorCode, size, stock, sku } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Tìm variant cần cập nhật
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Variant not found' } 
      });
    }

    // Kiểm tra SKU nếu có thay đổi
    if (sku && sku !== variant.sku) {
      const checkSku = await Product.findOne({ 
        'variants.sku': sku,
        'variants._id': { $ne: variantId }
      });
      if (checkSku) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Variant SKU is already in use' } 
        });
      }
    }

    // Cập nhật thông tin variant
    if (color) variant.color = color;
    if (colorCode !== undefined) variant.colorCode = colorCode;
    if (size) variant.size = size;
    if (stock !== undefined) variant.stock = stock;
    if (sku) variant.sku = sku;

    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Variant updated successfully',
        variants: product.variants
      } 
    });
  } catch (error) {
    console.error('UpdateVariant Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA VARIANT
// =============================================
exports.deleteVariant = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.params.variantId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Xóa variant
    product.variants.pull(variantId);
    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Variant deleted successfully',
        variants: product.variants
      } 
    });
  } catch (error) {
    console.error('DeleteVariant Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: UPLOAD HÌNH ẢNH SẢN PHẨM
// =============================================
exports.uploadImages = async (req, res) => {
  try {
    const productId = req.params.id;

    // Kiểm tra files upload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Please upload at least one image' } 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Thêm images mới
    const newImages = req.files.map((file, index) => ({
      url: file.path,
      isPrimary: product.images.length === 0 && index === 0, // Ảnh đầu tiên làm primary nếu chưa có ảnh
      alt: `${product.name} - Image ${product.images.length + index + 1}`
    }));

    product.images.push(...newImages);
    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Images uploaded successfully',
        images: product.images
      } 
    });
  } catch (error) {
    console.error('UploadImages Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA HÌNH ẢNH SẢN PHẨM
// =============================================
exports.deleteImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Image URL is required' } 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Tìm và xóa image
    const imageIndex = product.images.findIndex(img => img.url === imageUrl);
    if (imageIndex === -1) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Image not found' } 
      });
    }

    // Xóa image trên cloudinary
    try {
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(`shoe-store/products/${publicId}`);
    } catch (err) {
      console.log('Error deleting image from cloudinary:', err);
    }

    // Xóa image khỏi array
    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Image deleted successfully',
        images: product.images
      } 
    });
  } catch (error) {
    console.error('DeleteImage Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: SET PRIMARY IMAGE
// =============================================
exports.setPrimaryImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Image URL is required' } 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Set tất cả images thành không primary
    product.images.forEach(img => {
      img.isPrimary = false;
    });

    // Set image được chọn thành primary
    const image = product.images.find(img => img.url === imageUrl);
    if (!image) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Image not found' } 
      });
    }

    image.isPrimary = true;
    await product.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Primary image set successfully',
        images: product.images
      } 
    });
  } catch (error) {
    console.error('SetPrimaryImage Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY SẢN PHẨM LIÊN QUAN
// =============================================
exports.getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 8;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    // Tìm sản phẩm cùng category hoặc cùng brand
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { categoryId: product.categoryId },
        { brandId: product.brandId }
      ]
    })
    .populate('categoryId', 'name slug')
    .populate('brandId', 'name slug logo')
    .limit(limit)
    .sort({ createdAt: -1 });

    res.status(200).json({ 
      status: 200, 
      data: { products: relatedProducts } 
    });
  } catch (error) {
    console.error('GetRelatedProducts Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};
