const jwt = require('jsonwebtoken');
const { User } = require('../../models/User');
const { env } = require('../../config/env');
const { successResponse } = require('../../utils/apiResponse');
const { ApiError } = require('../../utils/apiError');
const { AuthToken, AUTH_TOKEN_TYPES } = require('../../models/AuthToken');

function generateTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

async function registerAdmin(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const existing = await User.findOne({ email, role: 'admin' });
    if (existing) {
      throw new ApiError(409, 'Admin with this email already exists');
    }

    const user = await User.create({ name, email, password, role: 'admin', emailVerified: false });
    const tokens = generateTokens(user);

    const debug = env.NODE_ENV !== 'production' ? { adminTokens: tokens } : undefined;

    return successResponse(res, {
      statusCode: 201,
      message: 'Admin registered successfully',
      data: { user, ...tokens, ...(debug || {}) },
    });
  } catch (err) {
    return next(err);
  }
}

async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokens = generateTokens(user);

    return successResponse(res, {
      message: 'Admin logged in successfully',
      data: { user, ...tokens },
    });
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'currentPassword and newPassword are required');
    }

    const user = req.user;
    if (!user || user.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: only admins can change their password via this endpoint');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, {
      message: 'Password changed successfully',
    });
  } catch (err) {
    return next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return successResponse(res, {
        message: 'If an admin with this email exists, an OTP has been sent',
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await AuthToken.deleteMany({ user: user._id, type: AUTH_TOKEN_TYPES.PASSWORD_RESET });
    await AuthToken.create({
      user: user._id,
      type: AUTH_TOKEN_TYPES.PASSWORD_RESET,
      otp,
      expiresAt,
    });

    const debug = env.NODE_ENV !== 'production' ? { resetOtp: otp } : undefined;

    return successResponse(res, {
      message: 'If an admin with this email exists, an OTP has been sent',
      data: debug || undefined,
    });
  } catch (err) {
    return next(err);
  }
}

async function setPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new ApiError(400, 'Email, OTP, and newPassword are required');
    }

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      throw new ApiError(400, 'Invalid email or OTP');
    }

    const tokenDoc = await AuthToken.findOne({
      user: user._id,
      type: AUTH_TOKEN_TYPES.PASSWORD_RESET,
      otp,
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    user.password = newPassword;
    await user.save();

    await AuthToken.deleteMany({ user: user._id, type: AUTH_TOKEN_TYPES.PASSWORD_RESET });

    return successResponse(res, {
      message: 'Password has been reset successfully',
    });
  } catch (err) {
    return next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { otp } = req.body;

    if (!otp) {
      throw new ApiError(400, 'OTP is required');
    }

    const user = req.user;
    if (!user || user.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: only admins can verify email via this endpoint');
    }

    const tokenDoc = await AuthToken.findOne({
      user: user._id,
      type: AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
      otp,
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    user.emailVerified = true;
    await user.save();

    await AuthToken.deleteMany({ user: user._id, type: AUTH_TOKEN_TYPES.EMAIL_VERIFICATION });

    return successResponse(res, {
      message: 'Email verified successfully',
      data: { user },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  changePassword,
  forgotPassword,
  setPassword,
  verifyEmail,
};
