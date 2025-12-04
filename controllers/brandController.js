const { Brand } = require('../models');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cấu hình Multer với Cloudinary Storage cho brand logos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoe-store/brands',
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Middleware upload brand logo
exports.uploadBrandLogo = upload.single('logo');

// =============================================
// LẤY DANH SÁCH THƯƠNG HIỆU (PUBLIC)
// =============================================
exports.getAllBrands = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      isActive,
      sortBy = 'name', 
      order = 'asc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const brands = await Brand.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Brand.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        brands,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllBrands Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY THƯƠNG HIỆU THEO ID
// =============================================
exports.getBrandById = async (req, res) => {
  try {
    const brandId = req.params.id;

    const brand = await Brand.findById(brandId);

    if (!brand) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Brand not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { brand } 
    });
  } catch (error) {
    console.error('GetBrandById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY THƯƠNG HIỆU THEO SLUG
// =============================================
exports.getBrandBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const brand = await Brand.findOne({ slug });

    if (!brand) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Brand not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { brand } 
    });
  } catch (error) {
    console.error('GetBrandBySlug Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: TẠO THƯƠNG HIỆU MỚI
// =============================================
exports.createBrand = async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body;

    // Validate input
    if (!name || !slug) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Name and slug are required' } 
      });
    }

    // Kiểm tra slug đã tồn tại
    const existingBrand = await Brand.findOne({ slug });
    if (existingBrand) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Slug already exists' } 
      });
    }

    // Xử lý logo nếu có upload
    const logo = req?.file?.path || null;

    // Tạo brand mới
    const newBrand = await Brand.create({
      name,
      slug,
      logo,
      description: description || null,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ 
      status: 201, 
      data: { 
        message: 'Brand created successfully',
        brand: newBrand
      } 
    });
  } catch (error) {
    console.error('CreateBrand Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT THƯƠNG HIỆU
// =============================================
exports.updateBrand = async (req, res) => {
    try {
        const brandId = req.params.id;
        let updateData = req.body; 
        const logoFile = req?.file?.path; 
        
        if (updateData.isActive !== undefined) {
             updateData.isActive = updateData.isActive === 'true';
        }
        
        if (logoFile) {
            updateData.logo = logoFile;
        }

        const brand = await Brand.findById(brandId);
        if (!brand) {
             return res.status(404).json({ 
                 status: 404, 
                 data: { message: 'Brand not found' } 
             });
        }

        if (updateData.slug && updateData.slug !== brand.slug) {
            const existingBrand = await Brand.findOne({ 
                slug: updateData.slug, 
                _id: { $ne: brandId } 
            });
            if (existingBrand) {
                return res.status(400).json({ 
                    status: 400, 
                    data: { message: 'Slug already exists' } 
                });
            }
        }

        const updatedBrand = await Brand.findByIdAndUpdate(
            brandId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            status: 200, 
            data: { 
                message: 'Cập nhật thương hiệu thành công!',
                brand: updatedBrand
            } 
        });
    } catch (error) {
        console.error('UpdateBrand Error:', error);
        res.status(500).json({ 
            status: 500, 
            data: { message: 'Server error', error: error.message } 
        });
    }
};

// =============================================
// ADMIN: XÓA THƯƠNG HIỆU
// =============================================
exports.deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Brand not found' } 
      });
    }

    // Xóa logo trên cloudinary nếu có
    if (brand.logo && brand.logo.includes('cloudinary')) {
      try {
        const publicId = brand.logo.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`shoe-store/brands/${publicId}`);
      } catch (err) {
        console.log('Error deleting brand logo:', err);
      }
    }

    await Brand.findByIdAndDelete(brandId);

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Brand deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteBrand Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT LOGO
// =============================================
exports.updateBrandLogo = async (req, res) => {
  try {
    const brandId = req.params.id;

    // Kiểm tra file upload
    if (!req.file) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Please upload a logo' } 
      });
    }

    const logoUrl = req.file.path;

    // Lấy thông tin brand cũ để xóa logo cũ
    const oldBrand = await Brand.findById(brandId);
    if (!oldBrand) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Brand not found' } 
      });
    }

    // Xóa logo cũ trên cloudinary (nếu có)
    if (oldBrand.logo && oldBrand.logo.includes('cloudinary')) {
      try {
        const publicId = oldBrand.logo.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`shoe-store/brands/${publicId}`);
      } catch (err) {
        console.log('Error deleting old brand logo:', err);
      }
    }

    // Cập nhật logo mới
    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { logo: logoUrl },
      { new: true }
    );

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Brand logo updated successfully',
        brand: updatedBrand
      } 
    });
  } catch (error) {
    console.error('UpdateBrandLogo Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: BẬT/TẮT TRẠNG THÁI THƯƠNG HIỆU
// =============================================
exports.toggleBrandStatus = async (req, res) => {
  try {
    const brandId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'isActive is required' } 
      });
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { isActive },
      { new: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Brand not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: `${isActive ? 'Mở hiển thị thương hiệu thành công!' : 'Tắt hiển thị thương hiệu thành công!'}`,
        brand: updatedBrand
      } 
    });
  } catch (error) {
    console.error('ToggleBrandStatus Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY DANH SÁCH THƯƠNG HIỆU ĐANG HOẠT ĐỘNG
// =============================================
exports.getActiveBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .sort({ name: 1 })
      .select('name slug logo');

    res.status(200).json({ 
      status: 200, 
      data: { brands } 
    });
  } catch (error) {
    console.error('GetActiveBrands Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
  }
