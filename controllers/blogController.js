const { Blog, Category } = require('../models');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cấu hình Multer với Cloudinary Storage cho blog thumbnails
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoe-store/blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware upload blog thumbnail
exports.uploadBlogThumbnail = upload.single('thumbnail');

// =============================================
// LẤY DANH SÁCH BÀI VIẾT (PUBLIC)
// =============================================
exports.getAllBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      categoryId, 
      tag,
      search, 
      sortBy = 'publishedAt', 
      order = 'desc' 
    } = req.query;

    // Build query - chỉ lấy bài viết đã publish
    const query = { isPublished: true };
    
    if (categoryId) query.categoryId = categoryId;
    if (tag) query.tags = tag;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const blogs = await Blog.find(query)
      .select('-content') // Không lấy content để giảm payload
      .populate('authorId', 'fullName avatar')
      .populate('categoryId', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        blogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllBlogs Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY TẤT CẢ BÀI VIẾT
// =============================================
exports.getAllBlogsAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isPublished,
      categoryId,
      authorId,
      search, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (categoryId) query.categoryId = categoryId;
    if (authorId) query.authorId = authorId;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const blogs = await Blog.find(query)
      .populate('authorId', 'fullName email avatar')
      .populate('categoryId', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        blogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllBlogsAdmin Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY BÀI VIẾT THEO ID
// =============================================
exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId)
      .populate('authorId', 'fullName email avatar')
      .populate('categoryId', 'name slug description');

    if (!blog) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Blog not found' } 
      });
    }

    // Nếu không phải admin và bài viết chưa publish thì không cho xem
    if (!blog.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'Blog is not published yet' } 
      });
    }

    // Tăng view count
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json({ 
      status: 200, 
      data: { blog } 
    });
  } catch (error) {
    console.error('GetBlogById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY BÀI VIẾT THEO SLUG
// =============================================
exports.getBlogBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const blog = await Blog.findOne({ slug })
      .populate('authorId', 'fullName avatar')
      .populate('categoryId', 'name slug description');

    if (!blog) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Blog not found' } 
      });
    }

    // Nếu không phải admin và bài viết chưa publish thì không cho xem
    if (!blog.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'Blog is not published yet' } 
      });
    }

    // Tăng view count
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json({ 
      status: 200, 
      data: { blog } 
    });
  } catch (error) {
    console.error('GetBlogBySlug Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: TẠO BÀI VIẾT MỚI
// =============================================
exports.createBlog = async (req, res) => {
  try {
    const authorId = req.user.userId; // Lấy từ middleware auth
    const {
      title,
      slug,
      content,
      excerpt,
      categoryId,
      tags,
      seo,
      isPublished
    } = req.body;

    // Validate input
    if (!title || !slug || !content) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Title, slug and content are required' } 
      });
    }

    // Kiểm tra slug đã tồn tại
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Slug already exists' } 
      });
    }

    // Kiểm tra category nếu có
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ 
          status: 404, 
          data: { message: 'Category not found' } 
        });
      }
    }

    // Xử lý thumbnail nếu có upload
    const thumbnail = req.file ? req.file.path : null;

    // Tạo blog mới
    const newBlog = await Blog.create({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      thumbnail,
      authorId,
      categoryId: categoryId || null,
      tags: tags || [],
      seo: seo || {},
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Blog created successfully',
        blog: newBlog
      } 
    });
  } catch (error) {
    console.error('CreateBlog Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT BÀI VIẾT
// =============================================
exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const updateData = req.body;

    // Kiểm tra blog tồn tại
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Blog not found' } 
      });
    }

    // Kiểm tra slug nếu có thay đổi
    if (updateData.slug && updateData.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: blogId } 
      });
      if (existingBlog) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Slug already exists' } 
        });
      }
    }

    // Kiểm tra category nếu có thay đổi
    if (updateData.categoryId && updateData.categoryId !== blog.categoryId?.toString()) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(404).json({ 
          status: 404, 
          data: { message: 'Category not found' } 
        });
      }
    }

    // Nếu chuyển từ chưa publish sang published, cập nhật publishedAt
    if (updateData.isPublished === true && !blog.isPublished) {
      updateData.publishedAt = new Date();
    }

    // Nếu chuyển từ published sang chưa publish, xóa publishedAt
    if (updateData.isPublished === false && blog.isPublished) {
      updateData.publishedAt = null;
    }

    // Cập nhật blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true, runValidators: true }
    ).populate('authorId', 'fullName email avatar')
     .populate('categoryId', 'name slug');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Blog updated successfully',
        blog: updatedBlog
      } 
    });
  } catch (error) {
    console.error('UpdateBlog Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA BÀI VIẾT
// =============================================
exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Blog not found' } 
      });
    }

    // Xóa thumbnail trên cloudinary nếu có
    if (blog.thumbnail && blog.thumbnail.includes('cloudinary')) {
      try {
        const publicId = blog.thumbnail.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`shoe-store/blogs/${publicId}`);
      } catch (err) {
        console.log('Error deleting blog thumbnail:', err);
      }
    }

    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Blog deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteBlog Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT THUMBNAIL
// =============================================
exports.updateBlogThumbnail = async (req, res) => {
  try {
    const blogId = req.params.id;

    // Kiểm tra file upload
    if (!req.file) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Please upload a thumbnail' } 
      });
    }

    const thumbnailUrl = req.file.path;

    // Lấy thông tin blog cũ để xóa thumbnail cũ
    const oldBlog = await Blog.findById(blogId);
    if (!oldBlog) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Blog not found' } 
      });
    }

    // Xóa thumbnail cũ trên cloudinary (nếu có)
    if (oldBlog.thumbnail && oldBlog.thumbnail.includes('cloudinary')) {
      try {
        const publicId = oldBlog.thumbnail.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`shoe-store/blogs/${publicId}`);
      } catch (err) {
        console.log('Error deleting old blog thumbnail:', err);
      }
    }

    // Cập nhật thumbnail mới
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { thumbnail: thumbnailUrl },
      { new: true }
    ).populate('authorId', 'fullName avatar')
     .populate('categoryId', 'name slug');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Blog thumbnail updated successfully',
        blog: updatedBlog
      } 
    });
  } catch (error) {
    console.error('UpdateBlogThumbnail Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: PUBLISH/UNPUBLISH BÀI VIẾT
// =============================================
exports.togglePublishBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { isPublished } = req.body;

    if (isPublished === undefined) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'isPublished is required' } 
      });
    }

    const updateData = { 
      isPublished,
      publishedAt: isPublished ? new Date() : null
    };

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true }
    ).populate('authorId', 'fullName avatar')
     .populate('categoryId', 'name slug');

    if (!updatedBlog) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Blog not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: `Blog ${isPublished ? 'published' : 'unpublished'} successfully`,
        blog: updatedBlog
      } 
    });
  } catch (error) {
    console.error('TogglePublishBlog Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY BÀI VIẾT LIÊN QUAN
// =============================================
exports.getRelatedBlogs = async (req, res) => {
  try {
    const blogId = req.params.id;
    const limit = parseInt(req.query.limit) || 4;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Blog not found' } 
      });
    }

    // Tìm bài viết liên quan: cùng category hoặc có tags giống nhau
    const relatedBlogs = await Blog.find({
      _id: { $ne: blogId },
      isPublished: true,
      $or: [
        { categoryId: blog.categoryId },
        { tags: { $in: blog.tags } }
      ]
    })
    .select('-content')
    .populate('authorId', 'fullName avatar')
    .populate('categoryId', 'name slug')
    .limit(limit)
    .sort({ publishedAt: -1 });

    res.status(200).json({ 
      status: 200, 
      data: { blogs: relatedBlogs } 
    });
  } catch (error) {
    console.error('GetRelatedBlogs Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY BÀI VIẾT PHỔ BIẾN
// =============================================
exports.getPopularBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const popularBlogs = await Blog.find({ isPublished: true })
      .select('-content')
      .populate('authorId', 'fullName avatar')
      .populate('categoryId', 'name slug')
      .sort({ viewCount: -1 })
      .limit(limit);

    res.status(200).json({ 
      status: 200, 
      data: { blogs: popularBlogs } 
    });
  } catch (error) {
    console.error('GetPopularBlogs Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY BÀI VIẾT MỚI NHẤT
// =============================================
exports.getLatestBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const latestBlogs = await Blog.find({ isPublished: true })
      .select('-content')
      .populate('authorId', 'fullName avatar')
      .populate('categoryId', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.status(200).json({ 
      status: 200, 
      data: { blogs: latestBlogs } 
    });
  } catch (error) {
    console.error('GetLatestBlogs Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY TẤT CẢ TAGS
// =============================================
exports.getAllTags = async (req, res) => {
  try {
    // Lấy tất cả tags từ các blog đã publish
    const tags = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({ 
      status: 200, 
      data: { tags } 
    });
  } catch (error) {
    console.error('GetAllTags Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY BÀI VIẾT CỦA TÁC GIẢ
// =============================================
exports.getBlogsByAuthor = async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const { page = 1, limit = 10 } = req.query;

    // Build query
    const query = { authorId, isPublished: true };

    // Pagination
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .select('-content')
      .populate('authorId', 'fullName avatar')
      .populate('categoryId', 'name slug')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        blogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetBlogsByAuthor Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY THỐNG KÊ BLOG
// =============================================
exports.getBlogStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query for date range
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Tổng số blog
    const totalBlogs = await Blog.countDocuments(dateQuery);

    // Số blog đã publish
    const publishedBlogs = await Blog.countDocuments({ ...dateQuery, isPublished: true });

    // Số blog chưa publish
    const draftBlogs = await Blog.countDocuments({ ...dateQuery, isPublished: false });

    // Tổng lượt xem
    const viewsData = await Blog.aggregate([
      { $match: { ...dateQuery, isPublished: true } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    const totalViews = viewsData.length > 0 ? viewsData[0].totalViews : 0;

    // Blog được xem nhiều nhất
    const topViewedBlogs = await Blog.find({ ...dateQuery, isPublished: true })
      .select('title slug viewCount publishedAt')
      .populate('authorId', 'fullName')
      .sort({ viewCount: -1 })
      .limit(10);

    // Phân bố theo category
    const blogsByCategory = await Blog.aggregate([
      { $match: { ...dateQuery, isPublished: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Populate category info
    await Category.populate(blogsByCategory, { 
      path: '_id', 
      select: 'name slug' 
    });

    // Top tác giả
    const topAuthors = await Blog.aggregate([
      { $match: { ...dateQuery, isPublished: true } },
      { $group: { _id: '$authorId', blogCount: { $sum: 1 }, totalViews: { $sum: '$viewCount' } } },
      { $sort: { blogCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate author info
    const { User } = require('../models');
    await User.populate(topAuthors, { 
      path: '_id', 
      select: 'fullName email avatar' 
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews,
        topViewedBlogs,
        blogsByCategory,
        topAuthors
      } 
    });
  } catch (error) {
    console.error('GetBlogStatistics Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};