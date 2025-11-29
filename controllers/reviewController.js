const { Review, Product, Order, User } = require('../models');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cấu hình Multer với Cloudinary Storage cho review images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoe-store/reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware upload review images
exports.uploadReviewImages = upload.array('images', 5);

// =============================================
// LẤY DANH SÁCH REVIEW CỦA SẢN PHẨM (PUBLIC)
// =============================================
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = { 
      productId,
      isApproved: true // Chỉ hiển thị review đã được duyệt
    };
    
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const reviews = await Review.find(query)
      .populate('userId', 'fullName avatar')
      .populate('reply.repliedBy', 'fullName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Tính thống kê rating
    const ratingStats = await Review.aggregate([
      { $match: { productId: require('mongoose').Types.ObjectId(productId), isApproved: true } },
      { $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }},
      { $sort: { _id: -1 } }
    ]);

    const totalReviews = await Review.countDocuments({ productId, isApproved: true });
    const avgRatingData = await Review.aggregate([
      { $match: { productId: require('mongoose').Types.ObjectId(productId), isApproved: true } },
      { $group: {
        _id: null,
        avgRating: { $avg: '$rating' }
      }}
    ]);

    const avgRating = avgRatingData.length > 0 ? avgRatingData[0].avgRating : 0;

    res.status(200).json({ 
      status: 200, 
      data: { 
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          totalReviews,
          avgRating: parseFloat(avgRating.toFixed(1)),
          ratingDistribution: ratingStats
        }
      } 
    });
  } catch (error) {
    console.error('GetProductReviews Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY TẤT CẢ REVIEW
// =============================================
exports.getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isApproved, 
      rating,
      productId,
      search,
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (rating) query.rating = parseInt(rating);
    if (productId) query.productId = productId;
    
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { 'reviewer.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const reviews = await Review.find(query)
      .populate('productId', 'name slug images')
      .populate('userId', 'fullName email avatar')
      .populate('orderId', 'orderNumber')
      .populate('reply.repliedBy', 'fullName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllReviews Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY REVIEW THEO ID
// =============================================
exports.getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId)
      .populate('productId', 'name slug images')
      .populate('userId', 'fullName email avatar')
      .populate('orderId', 'orderNumber')
      .populate('reply.repliedBy', 'fullName');

    if (!review) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Review not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { review } 
    });
  } catch (error) {
    console.error('GetReviewById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CUSTOMER: TẠO REVIEW MỚI
// =============================================
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth
    const { productId, orderId, rating, comment } = req.body;

    // Validate input
    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'ProductId, orderId, rating and comment are required' } 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Rating must be between 1 and 5' } 
      });
    }

    // Kiểm tra order tồn tại và thuộc về user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'You do not have permission to review this order' } 
      });
    }

    // Kiểm tra order đã delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'You can only review delivered orders' } 
      });
    }

    // Kiểm tra sản phẩm có trong order
    const orderItem = order.items.find(item => item.productId.toString() === productId);
    if (!orderItem) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Product not found in this order' } 
      });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({ productId, userId, orderId });
    if (existingReview) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'You have already reviewed this product' } 
      });
    }

    // Lấy thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    // Xử lý images nếu có upload
    const images = req.files ? req.files.map(file => file.path) : [];

    // Tạo review mới
    const newReview = await Review.create({
      productId,
      userId,
      orderId,
      rating,
      comment,
      images,
      reviewer: {
        name: user.fullName,
        avatar: user.avatar
      },
      isVerifiedPurchase: true,
      isApproved: false // Mặc định chưa duyệt, cần admin duyệt
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Review created successfully. It will be visible after approval.',
        review: newReview
      } 
    });
  } catch (error) {
    console.error('CreateReview Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CUSTOMER: CẬP NHẬT REVIEW
// =============================================
exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.userId; // Lấy từ middleware auth
    const { rating, comment } = req.body;

    // Kiểm tra review tồn tại
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Review not found' } 
      });
    }

    // Kiểm tra quyền sở hữu
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'You do not have permission to update this review' } 
      });
    }

    // Validate rating nếu có thay đổi
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Rating must be between 1 and 5' } 
      });
    }

    // Cập nhật review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    // Đặt lại trạng thái duyệt nếu có thay đổi
    review.isApproved = false;

    await review.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Review updated successfully. It will be reviewed again for approval.',
        review
      } 
    });
  } catch (error) {
    console.error('UpdateReview Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CUSTOMER: XÓA REVIEW
// =============================================
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.userId; // Lấy từ middleware auth

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Review not found' } 
      });
    }

    // Kiểm tra quyền sở hữu
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'You do not have permission to delete this review' } 
      });
    }

    // Xóa images trên cloudinary nếu có
    if (review.images && review.images.length > 0) {
      for (const image of review.images) {
        try {
          const publicId = image.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(`shoe-store/reviews/${publicId}`);
        } catch (err) {
          console.log('Error deleting review image:', err);
        }
      }
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Review deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteReview Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: DUYỆT REVIEW
// =============================================
exports.approveReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { isApproved } = req.body;

    if (isApproved === undefined) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'isApproved is required' } 
      });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved },
      { new: true }
    ).populate('productId', 'name slug')
     .populate('userId', 'fullName email');

    if (!review) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Review not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
        review
      } 
    });
  } catch (error) {
    console.error('ApproveReview Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: TRẢ LỜI REVIEW
// =============================================
exports.replyReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const adminId = req.user.userId; // Lấy từ middleware auth
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Reply content is required' } 
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Review not found' } 
      });
    }

    // Thêm reply
    review.reply = {
      content,
      repliedBy: adminId,
      repliedAt: new Date()
    };

    await review.save();

    // Populate thông tin trước khi trả về
    await review.populate('reply.repliedBy', 'fullName');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Reply added successfully',
        review
      } 
    });
  } catch (error) {
    console.error('ReplyReview Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA TRẢ LỜI REVIEW
// =============================================
exports.deleteReply = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Review not found' } 
      });
    }

    if (!review.reply) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Reply not found' } 
      });
    }

    // Xóa reply
    review.reply = undefined;
    await review.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Reply deleted successfully',
        review
      } 
    });
  } catch (error) {
    console.error('DeleteReply Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐÁNH DẤU REVIEW HỮU ÍCH
// =============================================
exports.markHelpful = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Review not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Marked as helpful',
        helpfulCount: review.helpfulCount
      } 
    });
  } catch (error) {
    console.error('MarkHelpful Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY REVIEW CỦA USER
// =============================================
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId; // Lấy từ params hoặc middleware auth
    const { page = 1, limit = 10 } = req.query;

    // Pagination
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .populate('productId', 'name slug images')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ userId });

    res.status(200).json({ 
      status: 200, 
      data: { 
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetUserReviews Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY THỐNG KÊ REVIEW
// =============================================
exports.getReviewStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query for date range
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Tổng số review
    const totalReviews = await Review.countDocuments(dateQuery);

    // Số review đã duyệt
    const approvedReviews = await Review.countDocuments({ ...dateQuery, isApproved: true });

    // Số review chờ duyệt
    const pendingReviews = await Review.countDocuments({ ...dateQuery, isApproved: false });

    // Phân bố rating
    const ratingDistribution = await Review.aggregate([
      { $match: dateQuery },
      { $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }},
      { $sort: { _id: -1 } }
    ]);

    // Trung bình rating
    const avgRatingData = await Review.aggregate([
      { $match: { ...dateQuery, isApproved: true } },
      { $group: {
        _id: null,
        avgRating: { $avg: '$rating' }
      }}
    ]);

    const avgRating = avgRatingData.length > 0 ? avgRatingData[0].avgRating : 0;

    // Top sản phẩm được review nhiều nhất
    const topReviewedProducts = await Review.aggregate([
      { $match: { ...dateQuery, isApproved: true } },
      { $group: {
        _id: '$productId',
        reviewCount: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }},
      { $sort: { reviewCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate product info
    await Product.populate(topReviewedProducts, { 
      path: '_id', 
      select: 'name slug images' 
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        totalReviews,
        approvedReviews,
        pendingReviews,
        avgRating: parseFloat(avgRating.toFixed(1)),
        ratingDistribution,
        topReviewedProducts
      } 
    });
  } catch (error) {
    console.error('GetReviewStatistics Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};