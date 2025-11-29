const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models');
require('dotenv').config();

const { JWT_PASS, EMAIL_USER, EMAIL_PASS, CLIENT_URL } = process.env;

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// =============================================
// ĐĂNG KÝ
// =============================================
exports.signUp = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Email, password and fullName are required' } 
      });
    }

    // Kiểm tra email đã tồn tại
    const checkDup = await User.findOne({ email });
    if (checkDup) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Email is already in use' } 
      });
    }

    // Kiểm tra phone đã tồn tại (nếu có)
    if (phone) {
      const checkPhone = await User.findOne({ phone });
      if (checkPhone) {
        return res.status(400).json({ 
          status: 400, 
          data: { message: 'Phone number is already in use' } 
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: 'customer'
    });

    // Tạo JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_PASS,
      { expiresIn: '7d' }
    );

    // Lưu token vào user
    newUser.token = token;
    await newUser.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Create account successfully',
        user: {
          id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          phone: newUser.phone,
          role: newUser.role
        },
        token
      } 
    });
  } catch (error) {
    console.error('SignUp Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐĂNG NHẬP
// =============================================
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Email and password are required' } 
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid email or password' } 
      });
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid email or password' } 
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_PASS,
      { expiresIn: '7d' }
    );

    // Lưu token vào user
    user.token = token;
    await user.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Login successfully',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints
        },
        token
      } 
    });
  } catch (error) {
    console.error('SignIn Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// QUÊN MẬT KHẨU - GỬI EMAIL
// =============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Email is required' } 
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Email not found' } 
      });
    }

    // Tạo reset token (6 chữ số)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    
    // Hash token và lưu vào user với thời gian hết hạn (10 phút)
    const hashedToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Gửi email
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Đặt lại mật khẩu - Phước Chung Shoe Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${user.fullName}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng truy cập vào địa chỉ sau để reset password của bạn </p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <a href="${CLIENT_URL}?token=${resetToken}">${CLIENT_URL}?token=${resetToken}</a>
          </div>
          <p><strong>Lưu ý:</strong> Mã này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Reset password code has been sent to your email',
        email: email
      } 
    });
  } catch (error) {
    console.error('ForgotPassword Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// XÁC THỰC MÃ RESET PASSWORD
// =============================================
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Email and code are required' } 
      });
    }

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Email not found' } 
      });
    }

    // Kiểm tra token có tồn tại và chưa hết hạn
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid or expired reset code' } 
      });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Reset code has expired' } 
      });
    }

    // Verify mã code
    const isValidCode = await bcrypt.compare(code, user.resetPasswordToken);
    if (!isValidCode) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid reset code' } 
      });
    }

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Reset code verified successfully',
        email: email
      } 
    });
  } catch (error) {
    console.error('VerifyResetCode Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐẶT LẠI MẬT KHẨU MỚI
// =============================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate input
    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Email, code and new password are required' } 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Password must be at least 6 characters' } 
      });
    }

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        data: { message: 'Email not found' } 
      });
    }

    // Kiểm tra token có tồn tại và chưa hết hạn
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid or expired reset code' } 
      });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Reset code has expired' } 
      });
    }

    // Verify mã code
    const isValidCode = await bcrypt.compare(code, user.resetPasswordToken);
    if (!isValidCode) {
      return res.status(400).json({ 
        status: 400, 
        data: { message: 'Invalid reset code' } 
      });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật password và xóa reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ 
      status: 200, 
      data: { 
        message: 'Password has been reset successfully' 
      } 
    });
  } catch (error) {
    console.error('ResetPassword Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// ĐĂNG XUẤT
// =============================================
exports.signOut = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth

    // Xóa token của user
    await User.findByIdAndUpdate(userId, { token: null });

    res.status(200).json({ 
      status: 200, 
      data: { message: 'Logout successfully' } 
    });
  } catch (error) {
    console.error('SignOut Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};

// =============================================
// LẤY THÔNG TIN USER HIỆN TẠI
// =============================================
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware auth

    const user = await User.findById(userId).select('-password -token');
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
    console.error('GetCurrentUser Error:', error);
    res.status(500).json({ 
      status: 500, 
      data: { message: 'Server error', error: error.message } 
    });
  }
};
