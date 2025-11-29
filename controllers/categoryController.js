const { Category, Product } = require('../models');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cấu hình Multer với Cloudinary Storage cho category images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoe-store/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware upload category image
exports.uploadCategoryImage = upload.single('image');

// =============================================
// LẤY DANH SÁCH TẤT CẢ DANH MỤC (PUBLIC)
// =============================================
exports.getAllCategories = async (req, res) => {
  try {
    const { isActive, parentId } = req.query;

    // Build query
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (parentId !== undefined) {
      query.parentId = parentId === 'null' ? null : parentId;
    }

    const categories = await Category.find(query)
      .populate('parentId', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({ 
      status: 200, 
      data: { categories } 
    });
  } catch (error) {
    console.error('GetAllCategories Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY DANH MỤC THEO ID
// =============================================
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId)
      .populate('parentId', 'name slug');

    if (!category) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Category not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { category } 
    });
  } catch (error) {
    console.error('GetCategoryById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY DANH MỤC THEO SLUG
// =============================================
exports.getCategoryBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const category = await Category.findOne({ slug, isActive: true })
      .populate('parentId', 'name slug');

    if (!category) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Category not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { category } 
    });
  } catch (error) {
    console.error('GetCategoryBySlug Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY DANH MỤC CHA (ROOT CATEGORIES)
// =============================================
exports.getRootCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      parentId: null, 
      isActive: true 
    }).sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({ 
      status: 200, 
      data: { categories } 
    });
  } catch (error) {
    console.error('GetRootCategories Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY DANH MỤC CON THEO PARENT ID
// =============================================
exports.getSubCategories = async (req, res) => {
  try {
    const parentId = req.params.parentId;

    const categories = await Category.find({ 
      parentId, 
      isActive: true 
    }).sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({ 
      status: 200, 
      data: { categories } 
    });
  } catch (error) {
    console.error('GetSubCategories Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: TẠO DANH MỤC MỚI
// =============================================
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, parentId, isActive, displayOrder } = req.body;

    // Validate input
    if (!name || !slug) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Name and slug are required' } 
      });
    }

    // Kiểm tra slug đã tồn tại
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Slug already exists' } 
      });
    }

    // Nếu có parentId, kiểm tra parent category có tồn tại không
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({ 
          status: 404, 
          data: { message: 'Parent category not found' } 
        });
      }
    }

    // Tạo category mới
    const newCategory = await Category.create({
      name,
      slug,
      description,
      image,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Category created successfully',
        category: newCategory
      } 
    });
  } catch (error) {
    console.error('CreateCategory Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT DANH MỤC
// =============================================
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, slug, description, image, parentId, isActive, displayOrder } = req.body;

    // Kiểm tra category có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Category not found' } 
      });
    }

    // Nếu thay đổi slug, kiểm tra slug mới đã tồn tại chưa
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Slug already exists' } 
        });
      }
    }

    // Nếu có parentId, kiểm tra parent category có tồn tại không
    if (parentId && parentId !== category.parentId) {
      // Không cho phép set parent là chính nó
      if (parentId === categoryId) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Category cannot be its own parent' } 
        });
      }

      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({ 
          status: 404, 
          data: { message: 'Parent category not found' } 
        });
      }
    }

    // Cập nhật category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name: name || category.name,
        slug: slug || category.slug,
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
        parentId: parentId !== undefined ? (parentId || null) : category.parentId,
        isActive: isActive !== undefined ? isActive : category.isActive,
        displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder
      },
      { new: true, runValidators: true }
    ).populate('parentId', 'name slug');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Category updated successfully',
        category: updatedCategory
      } 
    });
  } catch (error) {
    console.error('UpdateCategory Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA DANH MỤC
// =============================================
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Kiểm tra category có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Category not found' } 
      });
    }

    // Kiểm tra xem có danh mục con không
    const subCategories = await Category.find({ parentId: categoryId });
    if (subCategories.length > 0) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Cannot delete category with subcategories' } 
      });
    }

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const products = await Product.find({ categoryId });
    if (products.length > 0) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Cannot delete category with products' } 
      });
    }

    // Xóa image trên cloudinary nếu có
    if (category.image && category.image.includes('cloudinary')) {
      const publicId = category.image.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(`shoe-store/categories/${publicId}`);
      } catch (err) {
        console.log('Error deleting category image:', err);
      }
    }

    // Xóa category
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Category deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteCategory Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT HÌNH ẢNH DANH MỤC
// =============================================
exports.updateCategoryImage = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Kiểm tra file upload
    if (!req.file) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Please upload an image' } 
      });
    }

    const imageUrl = req.file.path;

    // Lấy thông tin category cũ để xóa image cũ trên cloudinary
    const oldCategory = await Category.findById(categoryId);
    if (!oldCategory) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Category not found' } 
      });
    }

    // Xóa image cũ trên cloudinary (nếu có)
    if (oldCategory.image && oldCategory.image.includes('cloudinary')) {
      const publicId = oldCategory.image.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(`shoe-store/categories/${publicId}`);
      } catch (err) {
        console.log('Error deleting old category image:', err);
      }
    }

    // Cập nhật image mới
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { image: imageUrl },
      { new: true }
    ).populate('parentId', 'name slug');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Category image updated successfully',
        category: updatedCategory
      } 
    });
  } catch (error) {
    console.error('UpdateCategoryImage Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
}; 
