const { Notification } = require('../models');
require('dotenv').config();

// =============================================
// LẤY DANH SÁCH THÔNG BÁO CỦA USER
// =============================================
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth
    const { page = 1, limit = 20, isRead, type } = req.query;

    // Build query
    const query = { userId };
    
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    // Pagination
    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ 
      status: 200, 
      data: { 
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        },
        unreadCount
      } 
    });
  } catch (error) {
    console.error('GetUserNotifications Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY TẤT CẢ THÔNG BÁO
// =============================================
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, isRead, type, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = {};
    
    if (userId) query.userId = userId;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const notifications = await Notification.find(query)
      .populate('userId', 'fullName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllNotifications Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY THÔNG BÁO THEO ID
// =============================================
exports.getNotificationById = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId; // Lấy từ middleware auth

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Notification not found' } 
      });
    }

    // Kiểm tra quyền truy cập (chỉ user sở hữu hoặc admin mới xem được)
    if (notification.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'You do not have permission to view this notification' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { notification } 
    });
  } catch (error) {
    console.error('GetNotificationById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN/SYSTEM: TẠO THÔNG BÁO MỚI
// =============================================
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, relatedId, relatedModel } = req.body;

    // Validate input
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserId, type, title and message are required' } 
      });
    }

    // Validate type
    const validTypes = ['order_status', 'promotion', 'stock_alert'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid notification type' } 
      });
    }

    // Tạo thông báo mới
    const newNotification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId: relatedId || null,
      relatedModel: relatedModel || null,
      isRead: false
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Notification created successfully',
        notification: newNotification
      } 
    });
  } catch (error) {
    console.error('CreateNotification Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN/SYSTEM: TẠO THÔNG BÁO CHO NHIỀU USER
// =============================================
exports.createBulkNotifications = async (req, res) => {
  try {
    const { userIds, type, title, message, relatedId, relatedModel } = req.body;

    // Validate input
    if (!userIds || !userIds.length || !type || !title || !message) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserIds, type, title and message are required' } 
      });
    }

    // Validate type
    const validTypes = ['order_status', 'promotion', 'stock_alert'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid notification type' } 
      });
    }

    // Tạo danh sách thông báo
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      relatedId: relatedId || null,
      relatedModel: relatedModel || null,
      isRead: false
    }));

    // Insert nhiều thông báo cùng lúc
    const createdNotifications = await Notification.insertMany(notifications);

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Bulk notifications created successfully',
        count: createdNotifications.length
      } 
    });
  } catch (error) {
    console.error('CreateBulkNotifications Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐÁNH DẤU ĐÃ ĐỌC MỘT THÔNG BÁO
// =============================================
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId; // Lấy từ middleware auth

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Notification not found' } 
      });
    }

    // Kiểm tra quyền sở hữu
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'You do not have permission to update this notification' } 
      });
    }

    // Đánh dấu đã đọc
    notification.isRead = true;
    await notification.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Notification marked as read',
        notification
      } 
    });
  } catch (error) {
    console.error('MarkAsRead Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐÁNH DẤU ĐÃ ĐỌC TẤT CẢ THÔNG BÁO
// =============================================
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'All notifications marked as read',
        modifiedCount: result.modifiedCount
      } 
    });
  } catch (error) {
    console.error('MarkAllAsRead Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// XÓA MỘT THÔNG BÁO
// =============================================
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId; // Lấy từ middleware auth

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Notification not found' } 
      });
    }

    // Kiểm tra quyền sở hữu
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'You do not have permission to delete this notification' } 
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Notification deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteNotification Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// XÓA TẤT CẢ THÔNG BÁO ĐÃ ĐỌC
// =============================================
exports.deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth

    const result = await Notification.deleteMany({ userId, isRead: true });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Read notifications deleted successfully',
        deletedCount: result.deletedCount
      } 
    });
  } catch (error) {
    console.error('DeleteReadNotifications Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// XÓA TẤT CẢ THÔNG BÁO CỦA USER
// =============================================
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'All notifications deleted successfully',
        deletedCount: result.deletedCount
      } 
    });
  } catch (error) {
    console.error('DeleteAllNotifications Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐẾM SỐ THÔNG BÁO CHƯA ĐỌC
// =============================================
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ 
      status: 200, 
      data: { unreadCount } 
    });
  } catch (error) {
    console.error('GetUnreadCount Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY THỐNG KÊ THÔNG BÁO
// =============================================
exports.getNotificationStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query for date range
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Tổng số thông báo
    const totalNotifications = await Notification.countDocuments(dateQuery);

    // Số thông báo đã đọc
    const readNotifications = await Notification.countDocuments({ ...dateQuery, isRead: true });

    // Số thông báo chưa đọc
    const unreadNotifications = await Notification.countDocuments({ ...dateQuery, isRead: false });

    // Phân bố theo loại
    const notificationsByType = await Notification.aggregate([
      { $match: dateQuery },
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    // Thông báo theo ngày (7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const notificationsByDay = await Notification.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ 
      status: 200, 
      data: { 
        totalNotifications,
        readNotifications,
        unreadNotifications,
        notificationsByType,
        notificationsByDay
      } 
    });
  } catch (error) {
    console.error('GetNotificationStatistics Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};