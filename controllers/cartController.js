const { Cart, Product } = require('../models');
require('dotenv').config();

// =============================================
// LẤY GIỎ HÀNG
// =============================================
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.userId; // Lấy từ middleware auth nếu có
    const sessionId = req.body.sessionId || req.query.sessionId; // Lấy từ body hoặc query

    // Tìm giỏ hàng theo userId hoặc sessionId
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId })
        .populate('items.productId', 'name slug images price salePrice isActive');
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId })
        .populate('items.productId', 'name slug images price salePrice isActive');
    } else {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserId or sessionId is required' } 
      });
    }

    if (!cart) {
      return res.status(200).json({ 
        status: 200, 
        data: { 
          cart: {
            items: [],
            totalAmount: 0
          }
        } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { cart } 
    });
  } catch (error) {
    console.error('GetCart Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// THÊM SẢN PHẨM VÀO GIỎ HÀNG
// =============================================
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId; // Lấy từ middleware auth nếu có
    const {
      sessionId,
      productId,
      variantId,
      quantity
    } = req.body;

    // Validate input
    if (!productId || !variantId || !quantity) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'ProductId, variantId and quantity are required' } 
      });
    }

    if (!userId && !sessionId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserId or sessionId is required' } 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Quantity must be at least 1' } 
      });
    }

    // Tìm sản phẩm và variant
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    if (!product.isActive) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Product is not available' } 
      });
    }

    // Tìm variant
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Variant not found' } 
      });
    }

    // Kiểm tra tồn kho
    if (variant.stock < quantity) {
      return res.status(400).json({ 
        status: 400, 
        data: { 
          message: 'Not enough stock',
          availableStock: variant.stock
        } 
      });
    }

    // Tìm hoặc tạo giỏ hàng
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      cart = await Cart.create({
        userId: userId || null,
        sessionId: sessionId || null,
        items: [],
        totalAmount: 0
      });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.variantId.toString() === variantId
    );

    const price = product.salePrice || product.price;
    const primaryImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url;

    if (existingItemIndex > -1) {
      // Nếu đã có, cập nhật số lượng
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Kiểm tra tồn kho cho số lượng mới
      if (variant.stock < newQuantity) {
        return res.status(400).json({ 
          status: 400, 
          data: { 
            message: 'Not enough stock',
            availableStock: variant.stock,
            currentQuantityInCart: cart.items[existingItemIndex].quantity
          } 
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = price; // Cập nhật giá mới nhất
    } else {
      // Nếu chưa có, thêm mới
      cart.items.push({
        productId,
        variantId,
        productName: product.name,
        color: variant.color,
        size: variant.size,
        price,
        quantity,
        image: primaryImage
      });
    }

    // Tính lại tổng tiền
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    // Populate product info trước khi trả về
    await cart.populate('items.productId', 'name slug images price salePrice isActive');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Product added to cart successfully',
        cart
      } 
    });
  } catch (error) {
    console.error('AddToCart Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TRONG GIỎ HÀNG
// =============================================
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { sessionId, productId, variantId, quantity } = req.body;

    // Validate input
    if (!productId || !variantId || !quantity) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'ProductId, variantId and quantity are required' } 
      });
    }

    if (!userId && !sessionId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserId or sessionId is required' } 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Quantity must be at least 1' } 
      });
    }

    // Tìm giỏ hàng
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Cart not found' } 
      });
    }

    // Tìm sản phẩm trong giỏ hàng
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.variantId.toString() === variantId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Item not found in cart' } 
      });
    }

    // Kiểm tra tồn kho
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Product not found' } 
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Variant not found' } 
      });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({ 
        status: 400, 
        data: { 
          message: 'Not enough stock',
          availableStock: variant.stock
        } 
      });
    }

    // Cập nhật số lượng
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.salePrice || product.price; // Cập nhật giá mới nhất

    // Tính lại tổng tiền
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    // Populate product info trước khi trả về
    await cart.populate('items.productId', 'name slug images price salePrice isActive');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Cart item updated successfully',
        cart
      } 
    });
  } catch (error) {
    console.error('UpdateCartItem Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// XÓA SẢN PHẨM KHỎI GIỎ HÀNG
// =============================================
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { sessionId, productId, variantId } = req.body;

    // Validate input
    if (!productId || !variantId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'ProductId and variantId are required' } 
      });
    }

    if (!userId && !sessionId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserId or sessionId is required' } 
      });
    }

    // Tìm giỏ hàng
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Cart not found' } 
      });
    }

    // Lọc bỏ sản phẩm khỏi giỏ hàng
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && item.variantId.toString() === variantId)
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Item not found in cart' } 
      });
    }

    // Tính lại tổng tiền
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    // Populate product info trước khi trả về
    await cart.populate('items.productId', 'name slug images price salePrice isActive');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Item removed from cart successfully',
        cart
      } 
    });
  } catch (error) {
    console.error('RemoveFromCart Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// XÓA TOÀN BỘ GIỎ HÀNG
// =============================================
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserId or sessionId is required' } 
      });
    }

    // Tìm giỏ hàng
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Cart not found' } 
      });
    }

    // Xóa tất cả items
    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Cart cleared successfully',
        cart
      } 
    });
  } catch (error) {
    console.error('ClearCart Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// HỢP NHẤT GIỎ HÀNG (KHI USER ĐĂNG NHẬP)
// =============================================
exports.mergeCart = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'SessionId is required' } 
      });
    }

    // Tìm giỏ hàng của session (guest)
    const sessionCart = await Cart.findOne({ sessionId });
    
    // Tìm giỏ hàng của user
    let userCart = await Cart.findOne({ userId });

    // Nếu không có giỏ hàng session, chỉ trả về giỏ hàng user
    if (!sessionCart || sessionCart.items.length === 0) {
      if (!userCart) {
        userCart = await Cart.create({
          userId,
          items: [],
          totalAmount: 0
        });
      }
      await userCart.populate('items.productId', 'name slug images price salePrice isActive');
      return res.status(200).json({ 
        status: 200, 
        data: { 
          message: 'No session cart to merge',
          cart: userCart
        } 
      });
    }

    // Nếu user chưa có giỏ hàng, chuyển giỏ hàng session thành giỏ hàng user
    if (!userCart) {
      sessionCart.userId = userId;
      sessionCart.sessionId = null;
      await sessionCart.save();
      await sessionCart.populate('items.productId', 'name slug images price salePrice isActive');
      return res.status(200).json({ 
        status: 200, 
        data: { 
          message: 'Cart merged successfully',
          cart: sessionCart
        } 
      });
    }

    // Hợp nhất items từ session cart vào user cart
    for (const sessionItem of sessionCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        item => item.productId.toString() === sessionItem.productId.toString() && 
                item.variantId.toString() === sessionItem.variantId.toString()
      );

      if (existingItemIndex > -1) {
        // Nếu đã có, cộng dồn số lượng
        userCart.items[existingItemIndex].quantity += sessionItem.quantity;
      } else {
        // Nếu chưa có, thêm mới
        userCart.items.push(sessionItem);
      }
    }

    // Tính lại tổng tiền
    userCart.totalAmount = userCart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await userCart.save();

    // Xóa giỏ hàng session
    await Cart.findByIdAndDelete(sessionCart._id);

    // Populate product info trước khi trả về
    await userCart.populate('items.productId', 'name slug images price salePrice isActive');

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Cart merged successfully',
        cart: userCart
      } 
    });
  } catch (error) {
    console.error('MergeCart Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐẾM SỐ LƯỢNG ITEMS TRONG GIỎ HÀNG
// =============================================
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.query.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'UserId or sessionId is required' } 
      });
    }

    // Tìm giỏ hàng
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

    res.status(200).json({ 
      status: 200, 
      data: { count } 
    });
  } catch (error) {
    console.error('GetCartCount Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
}