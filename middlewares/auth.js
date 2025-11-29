const jwt = require("jsonwebtoken");
const { User } = require('../models');
require('dotenv').config();

const { JWT_PASS } = process.env;


// =============================================
// KIỂM TRA ĐĂNG NHẬP
// =============================================
exports.checkLogin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ 
        status: 401, 
        data: { message: 'Not logged in. Please login to continue' } 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_PASS);
    
    // Kiểm tra user có tồn tại và token còn hợp lệ
    const user = await User.findOne({ _id: decoded.userId, token });
    
    if (!user) {
      return res.status(401).json({ 
        status: 401, 
        data: { message: 'Invalid token. Please login again' } 
      });
    }

    // Gắn thông tin user vào request
    req.user = {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 401, 
        data: { message: 'Invalid token' } 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 401, 
        data: { message: 'Token expired. Please login again' } 
      });
    }
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// KIỂM TRA QUYỀN ADMIN
// =============================================
exports.checkAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        status: 401, 
        data: { message: 'Authentication required' } 
      });
    }

    if (req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'Access denied. Admin permission required' } 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// KIỂM TRA QUYỀN STAFF (Nhân viên)
// =============================================
exports.checkStaff = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        status: 401, 
        data: { message: 'Authentication required' } 
      });
    }

    if (req.user.role === 'admin' || req.user.role === 'staff') {
      next();
    } else {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'Access denied. Staff permission required' } 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// KIỂM TRA QUYỀN CUSTOMER (Khách hàng)
// =============================================
exports.checkCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        status: 401, 
        data: { message: 'Authentication required' } 
      });
    }

    if (req.user.role === 'customer' || req.user.role === 'admin' || req.user.role === 'staff') {
      next();
    } else {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'Access denied' } 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// KIỂM TRA SỞ HỮU TÀI NGUYÊN (User chỉ được truy cập tài nguyên của mình)
// Ví dụ: Chỉ được xem/sửa đơn hàng của chính mình
// =============================================
exports.checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.userId;

      // Nếu là admin thì cho phép truy cập tất cả
      if (req.user.role === 'admin') {
        return next();
      }

      // Tìm resource
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          status: 404, 
          data: { message: 'Resource not found' } 
        });
      }

      // Kiểm tra quyền sở hữu
      if (resource.userId && resource.userId.toString() !== userId.toString()) {
        return res.status(403).json({ 
          status: 403, 
          data: { message: 'Access denied. You do not own this resource' } 
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ 
        status: 500, 
        data: { message: 'Server error', error: error.message } 
      });
    }
  };
};

// =============================================
// OPTIONAL LOGIN (Cho phép cả guest và user đã login)
// Sử dụng cho các route như xem sản phẩm, giỏ hàng guest...
// =============================================
exports.optionalLogin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    
    // Nếu không có token thì vẫn cho qua, nhưng không gắn user
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_PASS);
      
      // Kiểm tra user có tồn tại
      const user = await User.findOne({ _id: decoded.userId, token });
      
      if (user) {
        req.user = {
          userId: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        };
      } else {
        req.user = null;
      }
    } catch (err) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};
