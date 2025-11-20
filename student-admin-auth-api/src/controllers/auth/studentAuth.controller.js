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

function generateNumericOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

async function register(req, res, next, role = 'student') {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const existing = await User.findOne({ email, role });
    if (existing) {
      throw new ApiError(409, `${role} with this email already exists`);
    }

    const user = await User.create({ name, email, password, role, emailVerified: false });
    const tokens = generateTokens(user);

    // Create email verification token (OTP-style) valid for 24 hours
    const otp = generateNumericOtp();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await AuthToken.create({
      user: user._id,
      type: AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
      otp,
      expiresAt,
    });

    // NOTE: In a real app, send the OTP via email/SMS.
    // For development/testing, return the OTP only when not in production.
    const debug = env.NODE_ENV !== 'production' ? { emailVerificationOtp: otp } : undefined;

    return successResponse(res, {
      statusCode: 201,
      message: `${role} registered successfully`,
      data: { user, ...tokens, ...(debug || {}) },
    });
  } catch (err) {
    return next(err);
  }
}

async function registerStudent(req, res, next) {
  return register(req, res, next, 'student');
}

async function loginStudent(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email, role: 'student' });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokens = generateTokens(user);

    return successResponse(res, {
      message: 'Student logged in successfully',
      data: { user, ...tokens },
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

    const user = await User.findOne({ email, role: 'student' });
    if (!user) {
      // Do not reveal whether the email exists
      return successResponse(res, {
        message: 'If a student with this email exists, an OTP has been sent',
      });
    }

    const otp = generateNumericOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await AuthToken.deleteMany({ user: user._id, type: AUTH_TOKEN_TYPES.PASSWORD_RESET });
    await AuthToken.create({
      user: user._id,
      type: AUTH_TOKEN_TYPES.PASSWORD_RESET,
      otp,
      expiresAt,
    });

    // TODO: Integrate with email/SMS service to send OTP
    const debug = env.NODE_ENV !== 'production' ? { resetOtp: otp } : undefined;

    return successResponse(res, {
      message: 'If a student with this email exists, an OTP has been sent',
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

    const user = await User.findOne({ email, role: 'student' });
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

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'currentPassword and newPassword are required');
    }

    const user = req.user;
    if (!user || user.role !== 'student') {
      throw new ApiError(403, 'Forbidden: only students can change their password via this endpoint');
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

async function verifyEmail(req, res, next) {
  try {
    const { otp } = req.body;

    if (!otp) {
      throw new ApiError(400, 'OTP is required');
    }

    const user = req.user;
    if (!user || user.role !== 'student') {
      throw new ApiError(403, 'Forbidden: only students can verify email via this endpoint');
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
  registerStudent,
  loginStudent,
  forgotPassword,
  setPassword,
  changePassword,
  verifyEmail,
};
