const { Voucher, Order } = require('../models');
require('dotenv').config();

// =============================================
// LẤY DANH SÁCH VOUCHER (PUBLIC)
// =============================================
exports.getAllVouchers = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, search } = req.query;

    // Build query
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Chỉ lấy voucher còn hạn và đang active cho public
    const currentDate = new Date();
    query.startDate = { $lte: currentDate };
    query.endDate = { $gte: currentDate };
    query.isActive = true;
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const vouchers = await Voucher.find(query)
      .populate('applicableProducts', 'name slug images price')
      .populate('applicableCategories', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Voucher.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        vouchers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllVouchers Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY DANH SÁCH TẤT CẢ VOUCHER
// =============================================
exports.getAllVouchersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const vouchers = await Voucher.find(query)
      .populate('applicableProducts', 'name slug')
      .populate('applicableCategories', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Voucher.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        vouchers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllVouchersAdmin Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY VOUCHER THEO ID
// =============================================
exports.getVoucherById = async (req, res) => {
  try {
    const voucherId = req.params.id;

    const voucher = await Voucher.findById(voucherId)
      .populate('applicableProducts', 'name slug images price')
      .populate('applicableCategories', 'name slug');

    if (!voucher) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Voucher not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { voucher } 
    });
  } catch (error) {
    console.error('GetVoucherById Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY VOUCHER THEO CODE
// =============================================
exports.getVoucherByCode = async (req, res) => {
  try {
    const code = req.params.code;

    const voucher = await Voucher.findOne({ code: code.toUpperCase() })
      .populate('applicableProducts', 'name slug images price')
      .populate('applicableCategories', 'name slug');

    if (!voucher) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Voucher not found' } 
      });
    }

    // Kiểm tra voucher còn hiệu lực không
    const currentDate = new Date();
    if (currentDate < voucher.startDate || currentDate > voucher.endDate) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher is expired or not yet valid' } 
      });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher is not active' } 
      });
    }

    if (voucher.usageCount >= voucher.maxUsage) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher usage limit reached' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { voucher } 
    });
  } catch (error) {
    console.error('GetVoucherByCode Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: TẠO VOUCHER MỚI
// =============================================
exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      maxUsage,
      maxUsagePerUser,
      applicableProducts,
      applicableCategories,
      startDate,
      endDate
    } = req.body;

    // Validate input
    if (!code || !description || !discountType || !discountValue || !maxUsage || !startDate || !endDate) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Code, description, discountType, discountValue, maxUsage, startDate and endDate are required' } 
      });
    }

    // Validate discount type
    if (!['fixed', 'percentage'].includes(discountType)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid discount type' } 
      });
    }

    // Validate percentage
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Discount percentage must be between 0 and 100' } 
      });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'End date must be after start date' } 
      });
    }

    // Kiểm tra code đã tồn tại
    const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingVoucher) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher code already exists' } 
      });
    }

    // Tạo voucher mới
    const newVoucher = await Voucher.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minOrderValue: minOrderValue || 0,
      maxUsage,
      maxUsagePerUser: maxUsagePerUser || 1,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true
    });

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Voucher created successfully',
        voucher: newVoucher
      } 
    });
  } catch (error) {
    console.error('CreateVoucher Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT VOUCHER
// =============================================
exports.updateVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;
    const updateData = req.body;

    // Kiểm tra voucher tồn tại
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Voucher not found' } 
      });
    }

    // Validate discount type nếu có thay đổi
    if (updateData.discountType && !['fixed', 'percentage'].includes(updateData.discountType)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid discount type' } 
      });
    }

    // Validate percentage nếu có thay đổi
    if (updateData.discountType === 'percentage' && updateData.discountValue && 
        (updateData.discountValue < 0 || updateData.discountValue > 100)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Discount percentage must be between 0 and 100' } 
      });
    }

    // Validate dates nếu có thay đổi
    const startDate = updateData.startDate ? new Date(updateData.startDate) : voucher.startDate;
    const endDate = updateData.endDate ? new Date(updateData.endDate) : voucher.endDate;
    if (startDate >= endDate) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'End date must be after start date' } 
      });
    }

    // Kiểm tra code nếu có thay đổi
    if (updateData.code && updateData.code.toUpperCase() !== voucher.code) {
      const existingVoucher = await Voucher.findOne({ 
        code: updateData.code.toUpperCase(), 
        _id: { $ne: voucherId } 
      });
      if (existingVoucher) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Voucher code already exists' } 
        });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // Cập nhật voucher
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      voucherId,
      updateData,
      { new: true, runValidators: true }
    ).populate('applicableProducts', 'name slug')
     .populate('applicableCategories', 'name slug');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Voucher updated successfully',
        voucher: updatedVoucher
      } 
    });
  } catch (error) {
    console.error('UpdateVoucher Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA VOUCHER
// =============================================
exports.deleteVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;

    const deletedVoucher = await Voucher.findByIdAndDelete(voucherId);

    if (!deletedVoucher) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Voucher not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Voucher deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteVoucher Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT TRẠNG THÁI VOUCHER
// =============================================
exports.updateVoucherStatus = async (req, res) => {
  try {
    const voucherId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'isActive is required' } 
      });
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      voucherId,
      { isActive },
      { new: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Voucher not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Voucher status updated successfully',
        voucher: updatedVoucher
      } 
    });
  } catch (error) {
    console.error('UpdateVoucherStatus Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// VALIDATE VOUCHER CHO ĐƠN HÀNG
// =============================================
exports.validateVoucher = async (req, res) => {
  try {
    const { code, orderTotal, productIds, userId } = req.body;

    // Validate input
    if (!code || !orderTotal) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Code and orderTotal are required' } 
      });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() })
      .populate('applicableProducts', '_id')
      .populate('applicableCategories', '_id');

    if (!voucher) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Voucher not found' } 
      });
    }

    // Kiểm tra trạng thái active
    if (!voucher.isActive) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher is not active' } 
      });
    }

    // Kiểm tra thời gian hiệu lực
    const currentDate = new Date();
    if (currentDate < voucher.startDate) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher is not yet valid' } 
      });
    }

    if (currentDate > voucher.endDate) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher has expired' } 
      });
    }

    // Kiểm tra số lần sử dụng
    if (voucher.usageCount >= voucher.maxUsage) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Voucher usage limit reached' } 
      });
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({ 
        status: 400, 
        data: { 
          message: `Minimum order value is ${voucher.minOrderValue}`,
          minOrderValue: voucher.minOrderValue
        } 
      });
    }

    // Kiểm tra số lần sử dụng của user (nếu có userId)
    if (userId && voucher.maxUsagePerUser) {
      const userUsageCount = await Order.countDocuments({
        userId,
        voucherCode: voucher.code,
        status: { $ne: 'cancelled' }
      });

      if (userUsageCount >= voucher.maxUsagePerUser) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'You have reached the maximum usage limit for this voucher' } 
        });
      }
    }

    // Kiểm tra sản phẩm áp dụng (nếu có)
    if (voucher.applicableProducts.length > 0 && productIds && productIds.length > 0) {
      const applicableProductIds = voucher.applicableProducts.map(p => p._id.toString());
      const hasApplicableProduct = productIds.some(id => applicableProductIds.includes(id.toString()));
      
      if (!hasApplicableProduct) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Voucher is not applicable to any products in your cart' } 
        });
      }
    }

    // Tính toán giảm giá
    let discountAmount = 0;
    if (voucher.discountType === 'fixed') {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === 'percentage') {
      discountAmount = (orderTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Voucher is valid',
        voucher: {
          code: voucher.code,
          description: voucher.description,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          discountAmount
        }
      } 
    });
  } catch (error) {
    console.error('ValidateVoucher Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY THỐNG KÊ VOUCHER
// =============================================
exports.getVoucherStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query for date range
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Tổng số voucher
    const totalVouchers = await Voucher.countDocuments(dateQuery);

    // Số voucher active
    const activeVouchers = await Voucher.countDocuments({ ...dateQuery, isActive: true });

    // Voucher hết hạn
    const expiredVouchers = await Voucher.countDocuments({
      ...dateQuery,
      endDate: { $lt: new Date() }
    });

    // Voucher sắp hết hạn (7 ngày tới)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringVouchers = await Voucher.countDocuments({
      ...dateQuery,
      endDate: { $gte: new Date(), $lte: sevenDaysFromNow },
      isActive: true
    });

    // Top voucher được sử dụng nhiều nhất
    const topUsedVouchers = await Voucher.find(dateQuery)
      .sort({ usageCount: -1 })
      .limit(10)
      .select('code description usageCount maxUsage discountType discountValue');

    // Tổng số lần sử dụng voucher
    const totalUsage = await Voucher.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);

    const totalUsageCount = totalUsage.length > 0 ? totalUsage[0].total : 0;

    res.status(200).json({
      status: 200,
      data: {
        totalVouchers,
        activeVouchers,
        expiredVouchers,
        expiringVouchers,
        totalUsageCount,
        topUsedVouchers
      }
    });
  } catch (error) {
    console.error('GetVoucherStatistics Error:', error);
    res.status(500).json({
      status: 500,
      data: { message: 'Server error', error: error.message }
    });
  }
};
