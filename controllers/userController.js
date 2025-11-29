
// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cấu hình Multer với Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoe-store/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware upload avatar
exports.uploadAvatar = upload.single('avatar');


// =============================================
// LẤY THÔNG TIN USER THEO ID
// =============================================
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select('-password -token -resetPasswordToken -resetPasswordExpires')
      .populate('wishlist', 'name slug price salePrice images');

    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { user } 
    });
  } catch (error) {
    console.error('GetUserById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CẬP NHẬT THÔNG TIN CÁ NHÂN
// =============================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone } = req.body;

    // Validate input
    if (!fullName) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Full name is required' } 
      });
    }

    // Kiểm tra phone đã tồn tại (nếu có thay đổi)
    if (phone) {
      const existingUser = await User.findOne({ 
        phone, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Phone number is already in use' } 
        });
      }
    }

    // Cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, phone },
      { new: true, runValidators: true }
    ).select('-password -token -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Profile updated successfully',
        user: updatedUser
      } 
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CẬP NHẬT ẢNH ĐẠI DIỆN
// =============================================
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Kiểm tra file upload
    if (!req.file) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Please upload an image' } 
      });
    }

    const avatarUrl = req.file.path;

    // Lấy thông tin user cũ để xóa avatar cũ trên cloudinary
    const oldUser = await User.findById(userId);
    
    // Xóa avatar cũ trên cloudinary (nếu không phải avatar mặc định)
    if (oldUser.avatar && !oldUser.avatar.includes('istockphoto')) {
      const publicId = oldUser.avatar.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(`shoe-store/avatars/${publicId}`);
      } catch (err) {
        console.log('Error deleting old avatar:', err);
      }
    }

    // Cập nhật avatar mới
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -token -resetPasswordToken -resetPasswordExpires');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Avatar updated successfully',
        avatar: updatedUser.avatar
      } 
    });
  } catch (error) {
    console.error('UpdateAvatar Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐỔI MẬT KHẨU
// =============================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Current password and new password are required' } 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'New password must be at least 6 characters' } 
      });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Current password is incorrect' } 
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Password changed successfully' } 
    });
  } catch (error) {
    console.error('ChangePassword Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// THÊM ĐỊA CHỈ MỚI
// =============================================
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipientName, phone, address, ward, district, city, isDefault } = req.body;

    // Validate input
    if (!recipientName || !phone || !address || !ward || !district || !city) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'All address fields are required' } 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    // Nếu là địa chỉ mặc định, set các địa chỉ khác thành false
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Nếu là địa chỉ đầu tiên, tự động set làm mặc định
    const isFirstAddress = user.addresses.length === 0;

    // Thêm địa chỉ mới
    user.addresses.push({
      recipientName,
      phone,
      address,
      ward,
      district,
      city,
      isDefault: isDefault || isFirstAddress
    });

    await user.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Address added successfully',
        addresses: user.addresses
      } 
    });
  } catch (error) {
    console.error('AddAddress Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CẬP NHẬT ĐỊA CHỈ
// =============================================
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.addressId;
    const { recipientName, phone, address, ward, district, city, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    // Tìm địa chỉ cần cập nhật
    const addressToUpdate = user.addresses.id(addressId);
    if (!addressToUpdate) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Address not found' } 
      });
    }

    // Nếu set làm địa chỉ mặc định, set các địa chỉ khác thành false
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Cập nhật thông tin địa chỉ
    if (recipientName) addressToUpdate.recipientName = recipientName;
    if (phone) addressToUpdate.phone = phone;
    if (address) addressToUpdate.address = address;
    if (ward) addressToUpdate.ward = ward;
    if (district) addressToUpdate.district = district;
    if (city) addressToUpdate.city = city;
    if (isDefault !== undefined) addressToUpdate.isDefault = isDefault;

    await user.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Address updated successfully',
        addresses: user.addresses
      } 
    });
  } catch (error) {
    console.error('UpdateAddress Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// XÓA ĐỊA CHỈ
// =============================================
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.addressId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    // Xóa địa chỉ
    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Address deleted successfully',
        addresses: user.addresses
      } 
    });
  } catch (error) {
    console.error('DeleteAddress Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY DANH SÁCH TẤT CẢ USER
// =============================================
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password -token -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllUsers Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT ROLE USER
// =============================================
exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Validate role
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid role. Must be: customer, staff, or admin' } 
      });
    }

    // Không cho phép tự thay đổi role của chính mình
    if (userId === req.user.userId.toString()) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Cannot change your own role' } 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password -token -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'User role updated successfully',
        user: updatedUser
      } 
    });
  } catch (error) {
    console.error('UpdateUserRole Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA USER
// =============================================
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Không cho phép xóa chính mình
    if (userId === req.user.userId.toString()) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Cannot delete your own account' } 
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { message: 'User deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteUser Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// THÊM/XÓA SẢN PHẨM VÀO WISHLIST
// =============================================
exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Product ID is required' } 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    // Kiểm tra sản phẩm đã có trong wishlist chưa
    const index = user.wishlist.indexOf(productId);
    
    if (index === -1) {
      // Thêm vào wishlist
      user.wishlist.push(productId);
      await user.save();
      
      return res.status(200).json({ 
        status: 200, 
        data: { 
          message: 'Product added to wishlist',
          wishlist: user.wishlist
        } 
      });
    } else {
      // Xóa khỏi wishlist
      user.wishlist.splice(index, 1);
      await user.save();
      
      return res.status(200).json({ 
        status: 200, 
        data: { 
          message: 'Product removed from wishlist',
          wishlist: user.wishlist
        } 
      });
    }
  } catch (error) {
    console.error('ToggleWishlist Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY WISHLIST
// =============================================
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .populate({
        path: 'wishlist',
        select: 'name slug price salePrice images rating isActive',
        match: { isActive: true }
      });

    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'User not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { wishlist: user.wishlist } 
    });
  } catch (error) {
    console.error('GetWishlist Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};


/**
 * @swagger
 * /profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Retrieve a user's profile information by their unique ID. Requires authentication.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *           example: 652af9b0e8a45a7b9b3f78a4
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Server error
 *                     error:
 *                       type: string
 *                       example: Cast to ObjectId failed for value "abc" at path "_id"
 */
