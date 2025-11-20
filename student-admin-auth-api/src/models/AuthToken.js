const mongoose = require('mongoose');

const AUTH_TOKEN_TYPES = {
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
};

const authTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(AUTH_TOKEN_TYPES),
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

authTokenSchema.index({ user: 1, type: 1 });

const AuthToken = mongoose.model('AuthToken', authTokenSchema);

module.exports = { AuthToken, AUTH_TOKEN_TYPES };
