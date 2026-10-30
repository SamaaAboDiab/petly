const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");
const { toAuthUser } = require("../utils/serializers");
const User = require("../models/User");
const { notify } = require("../services/notificationService");
const { sendEmail, resetPasswordEmail } = require("../services/emailService");

// @route   POST /api/auth/register
// @access  Public
// Role is never read from req.body - every user created here is "user".
// Promoting someone to "admin" is a deliberate, separate action done by an
// admin, never something a client can request for itself at signup.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, location } = req.body;

  const user = await User.create({ name, email, password, location, role: "user" });

  notify(user._id, {
    type: "system",
    title: `Welcome to Petly, ${user.name.split(" ")[0]}!`,
    body: "Browse pets, save your favorites, or list a pet of your own.",
    link: "/app/categories",
  });

  res.status(201).json({
    success: true,
    data: {
      user: toAuthUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // .select("+password") is required because the schema marks password as
  // select: false by default.
  const user = await User.findOne({ email }).select("+password");

  // Same generic message whether the email doesn't exist or the password is
  // wrong - confirming which one it was would let an attacker enumerate
  // registered emails.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  res.status(200).json({
    success: true,
    data: {
      user: toAuthUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user was already loaded (without the password) by the `protect` middleware.
  res.status(200).json({
    success: true,
    data: { user: toAuthUser(req.user) },
  });
});

const RESET_TTL_MINUTES = 30;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const clientUrl = () => (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim();

// @route   POST /api/auth/forgot-password
// @access  Public (rate-limited)
// Always answers the same way, so it can't be used to discover which emails
// have accounts.
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
    await user.save();

    const link = `${clientUrl()}/reset-password/${token}`;
    await sendEmail({ to: user.email, ...resetPasswordEmail({ name: user.name, link, minutes: RESET_TTL_MINUTES }) });
  }

  res.status(200).json({
    success: true,
    data: { message: "If an account exists for this email, a reset link is on its way." },
  });
});

// @route   POST /api/auth/reset-password
// @access  Public (rate-limited)
// Body: { token, password }. Signs the user in on success.
const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(req.body.token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new AppError("This reset link is invalid or has expired. Please request a new one.", 400);
  }

  user.password = req.body.password;
  // One-time link: clear it so it can't be reused.
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user: toAuthUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @route   POST /api/auth/logout
// @access  Private
// JWTs are stateless: the server never stores issued tokens, so it cannot
// "revoke" one. The real logout happens client-side by deleting the stored
// token; this endpoint keeps a predictable frontend contract.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: "Logged out successfully" },
  });
});

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword };
