
const { Order, Product, User } = require('../models');
require('dotenv').config();

// =============================================
// TẠO ĐơN HÀNG MỚI (PUBLIC/CUSTOMER)
// =============================================
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      customer,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      discount,
      voucherCode,
      loyaltyPointsUsed,
      loyaltyPointsDiscount,
      totalAmount,
      paymentMethod,
      note
    } = req.body;

    // Validate input
    if (!customer || !shippingAddress || !items || !items.length || !subtotal || !totalAmount || !paymentMethod) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Customer, shippingAddress, items, subtotal, totalAmount and paymentMethod are required' } 
      });
    }

    // Validate customer info
    if (!customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Customer name, email and phone are required' } 
      });
    }

    // Validate shipping address
    if (!shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.address || 
        !shippingAddress.ward || !shippingAddress.district || !shippingAddress.city) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'All shipping address fields are required' } 
      });
    }

    // Tạo order number duy nhất (format: ORD + timestamp + random)
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Tạo order mới
    const newOrder = await Order.create({
      orderNumber,
      userId: userId || null,
      customer,
      shippingAddress,
      items,
      subtotal,
      shippingFee: shippingFee || 0,
      discount: discount || 0,
      voucherCode: voucherCode || null,
      loyaltyPointsUsed: loyaltyPointsUsed || 0,
      loyaltyPointsDiscount: loyaltyPointsDiscount || 0,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        note: 'Đơn hàng đã được tạo',
        updatedAt: new Date()
      }],
      note: note || null
    });

    // Cập nhật stock cho các variants (giảm số lượng tồn kho)
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    // Nếu có userId và sử dụng loyalty points, trừ điểm của user
    if (userId && loyaltyPointsUsed > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: -loyaltyPointsUsed }
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Order created successfully',
        order: newOrder
      } 
    });
  } catch (error) {
    console.error('CreateOrder Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY DANH SÁCH ĐƠN HÀNG (ADMIN)
// =============================================
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      paymentMethod,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
      .populate('userId', 'fullName email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetAllOrders Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY ĐƠN HÀNG THEO ID
// =============================================
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('userId', 'fullName email phone avatar')
      .populate('items.productId', 'name slug images')
      .populate('statusHistory.updatedBy', 'fullName email');

    if (!order) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { order } 
    });
  } catch (error) {
    console.error('test Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY ĐƠN HÀNG THEO ORDER NUMBER
// =============================================
exports.getOrderByNumber = async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;

    const order = await Order.findOne({ orderNumber })
      .populate('userId', 'fullName email phone avatar')
      .populate('items.productId', 'name slug images')
      .populate('statusHistory.updatedBy', 'fullName email');

    if (!order) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { order } 
    });
  } catch (error) {
    console.error('GetOrderByNumber Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY ĐƠN HÀNG CỦA USER
// =============================================
//Tạm thời lấy ra tất cả đơn hàng của user, sau này có thể thêm filter và pagination trạng thái nếu scale lên
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId; // Lấy từ params hoặc từ middleware auth
    const { page = 1, limit = 999, status } = req.query;

    // Build query
    const query = { userId };
    if (status) query.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('items.productId', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({ 
      status: 200, 
      data: { 
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error('GetUserOrders Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
// =============================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, note } = req.body;
    const updatedBy = req.user.userId; // Lấy từ middleware auth

    // Validate input
    if (!status) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Status is required' } 
      });
    }

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid status value' } 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    // Không cho phép cập nhật status nếu đơn hàng đã cancelled hoặc delivered
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Cannot update status of cancelled or delivered order' } 
      });
    }

    // Cập nhật trạng thái
    order.status = status;
    order.statusHistory.push({
      status,
      note: note || `Trạng thái đơn hàng được cập nhật thành ${status}`,
      updatedBy,
      updatedAt: new Date()
    });

    await order.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Order status updated successfully',
        order
      } 
    });
  } catch (error) {
    console.error('UpdateOrderStatus Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT TRẠNG THÁI THANH TOÁN
// =============================================
exports.updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { paymentStatus } = req.body;

    // Validate input
    if (!paymentStatus) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Payment status is required' } 
      });
    }

    // Validate payment status value
    const validPaymentStatuses = ['pending', 'paid', 'failed'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid payment status value' } 
      });
    }

    const updateData = { paymentStatus };
    
    // Nếu chuyển sang trạng thái paid, lưu thời gian thanh toán
    if (paymentStatus === 'paid') {
      updateData.paidAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Payment status updated successfully',
        order: updatedOrder
      } 
    });
  } catch (error) {
    console.error('UpdatePaymentStatus Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: CẬP NHẬT THÔNG TIN VẬN CHUYỂN
// =============================================
exports.updateShippingInfo = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { carrier, trackingNumber, estimatedDeliveryDate } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    // Cập nhật thông tin vận chuyển
    order.shipping = {
      carrier: carrier || order.shipping?.carrier,
      trackingNumber: trackingNumber || order.shipping?.trackingNumber,
      estimatedDeliveryDate: estimatedDeliveryDate || order.shipping?.estimatedDeliveryDate
    };

    await order.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Shipping info updated successfully',
        order
      } 
    });
  } catch (error) {
    console.error('UpdateShippingInfo Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CUSTOMER: HỦY ĐƠN HÀNG
// =============================================
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { cancelReason } = req.body;
    const userId = req.user?.userId; // Lấy từ middleware auth nếu có

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    // Kiểm tra quyền hủy đơn (chỉ user sở hữu đơn hàng mới được hủy)
    if (userId && order.userId && order.userId.toString() !== userId) {
      return res.status(403).json({ 
        status: 403, 
        data: { message: 'You do not have permission to cancel this order' } 
      });
    }

    // Chỉ cho phép hủy đơn ở trạng thái pending hoặc confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Cannot cancel order in current status' } 
      });
    }

    // Cập nhật trạng thái hủy
    order.status = 'cancelled';
    order.cancelReason = cancelReason || 'Khách hàng hủy đơn';
    order.statusHistory.push({
      status: 'cancelled',
      note: cancelReason || 'Khách hàng hủy đơn',
      updatedBy: userId || null,
      updatedAt: new Date()
    });

    await order.save();

    // Hoàn lại stock cho các variants
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stock': item.quantity } }
      );
    }

    // Hoàn lại loyalty points nếu có
    if (order.userId && order.loyaltyPointsUsed > 0) {
      await User.findByIdAndUpdate(order.userId, {
        $inc: { loyaltyPoints: order.loyaltyPointsUsed }
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Order cancelled successfully',
        order
      } 
    });
  } catch (error) {
    console.error('CancelOrder Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: XÓA ĐƠN HÀNG
// =============================================
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Order not found' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Order deleted successfully' } 
    });
  } catch (error) {
    console.error('DeleteOrder Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ADMIN: LẤY THỐNG KÊ ĐƠN HÀNG
// =============================================
exports.getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate, granularity = 'day' } = req.query; // granularity: day, week, month

    // 1. Xây dựng truy vấn ngày tháng
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }
    
    // 2. Định nghĩa $group ID cho phân tích theo thời gian (granularity)
    let groupDateId;
    let dateFormat;
    switch (granularity) {
      case 'week':
        groupDateId = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        dateFormat = '%Y-W%W';
        break;
      case 'month':
        groupDateId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        dateFormat = '%Y-%m';
        break;
      case 'day':
      default:
        groupDateId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateFormat = '%Y-%m-%d';
        break;
    }

    // --- AGGREGATION PIPELINES ---

    // 3. KPI Tổng quan: Số lượng đơn hàng theo trạng thái
    const statusCounts = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 4. Doanh thu, Lợi nhuận và Đơn bị Hủy theo thời gian
    // Chỉ tính Doanh thu/Lợi nhuận cho đơn 'delivered' và 'paid'
    const revenueProfitByTime = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: groupDateId,
          totalRevenue: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$status', 'delivered'] }, { $eq: ['$paymentStatus', 'paid'] }] }, 
                '$totalAmount', 
                0
              ] 
            } 
          },
          totalProfit: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$status', 'delivered'] }, { $eq: ['$paymentStatus', 'paid'] }] }, 
                '$totalProfit', 
                0
              ] 
            } 
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          cancelledAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, '$totalAmount', 0]
            }
          },
          totalOrders: { $sum: 1 }
        },
      },
      { $sort: { _id: 1 } },
      { 
        $project: { 
          _id: 0, 
          date: { $dateToString: { format: dateFormat, date: { $min: '$createdAt' } } }, 
          revenue: '$totalRevenue', 
          profit: '$totalProfit', 
          cancelledOrders: 1,
          cancelledAmount: 1,
          totalOrders: 1
        } 
      }
    ]);

    // 5. Thống kê Top Sản phẩm bán chạy (theo số lượng)
    const topProducts = await Order.aggregate([
      { $match: { ...dateQuery, status: 'delivered' } }, // Chỉ tính đơn đã giao
      { $unwind: '$items' }, 
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      { $project: { _id: 1, productName: 1, totalQuantity: 1, totalRevenue: 1 } },
    ]);

    // 6. Tổng hợp các KPI quan trọng (Toàn bộ thời gian được chọn)
    const deliveredOrders = statusCounts.find(item => item._id === 'delivered')?.count || 0;
    const cancelledOrders = statusCounts.find(item => item._id === 'cancelled')?.count || 0;
    const shippingOrders = statusCounts.find(item => item._id === 'shipping')?.count || 0;

    const totalRevenue = revenueProfitByTime.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = revenueProfitByTime.reduce((sum, item) => sum + item.profit, 0);
    const totalCancelledAmount = revenueProfitByTime.reduce((sum, item) => sum + item.cancelledAmount, 0);
    const totalOrderCount = revenueProfitByTime.reduce((sum, item) => sum + item.totalOrders, 0);


    res.status(200).json({ 
      status: 200, 
      data: { 
        totalOrderCount,
        deliveredOrders,
        cancelledOrders,
        shippingOrders,
        totalRevenue,
        totalProfit,
        totalCancelledAmount,
        statusCounts: statusCounts,
        timeSeries: revenueProfitByTime, // Dữ liệu biểu đồ theo thời gian
        topProducts: topProducts
      } 
    });
  } catch (error) {
    console.error('GetAdminDashboardData Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};