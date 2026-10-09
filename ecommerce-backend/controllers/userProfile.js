const User = require('../models/user');
const { AppError } = require('../middleware/errorHandler');

const isValidId = (value) =>
  typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return next(new AppError('Please provide valid profile data', 400));
    }

    const updates = {};

    for (const field of ['name', 'phone', 'avatar']) {
      if (hasOwn(body, field)) {
        if (typeof body[field] !== 'string') {
          return next(new AppError(`${field} must be a string`, 400));
        }

        updates[field] = body[field].trim();
      }
    }

    if (
      hasOwn(updates, 'name') &&
      (updates.name.length < 2 || updates.name.length > 50)
    ) {
      return next(
        new AppError('Name must contain between 2 and 50 characters', 400)
      );
    }

    const addressUpdates = {};

    if (hasOwn(body, 'address')) {
      if (
        !body.address ||
        typeof body.address !== 'object' ||
        Array.isArray(body.address)
      ) {
        return next(new AppError('Address must be an object', 400));
      }

      for (const field of [
        'street',
        'city',
        'state',
        'zipCode',
        'country',
      ]) {
        if (hasOwn(body.address, field)) {
          if (typeof body.address[field] !== 'string') {
            return next(
              new AppError(`Address ${field} must be a string`, 400)
            );
          }

          addressUpdates[field] = body.address[field].trim();
        }
      }
    }

    if (
      Object.keys(updates).length === 0 &&
      Object.keys(addressUpdates).length === 0
    ) {
      return next(
        new AppError('Please provide at least one editable profile field', 400)
      );
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Only approved profile fields are updated.
    // Role, password, email and isActive cannot be changed here.
    for (const [field, value] of Object.entries(updates)) {
      user.set(field, value);
    }

    for (const [field, value] of Object.entries(addressUpdates)) {
      user.set(`address.${field}`, value);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(
        new AppError('Admin accounts cannot be deleted through this endpoint', 403)
      );
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const requestedPage = Number(req.query.page ?? 1);
    const requestedLimit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(requestedPage) ||
      requestedPage < 1 ||
      !Number.isSafeInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      return next(
        new AppError('Page and limit must be positive integers', 400)
      );
    }

    const page = requestedPage;
    const limit = Math.min(requestedLimit, 100);
    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip)) {
      return next(new AppError('Page number is too large', 400));
    }

    const [users, total] = await Promise.all([
      User.find({ role: 'user' })
        .select('-password')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: 'user' }),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users: users.map((user) => user.toSafeObject()),
    });
  } catch (error) {
    next(error);
  }
};

const updateUserByAdmin = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const { isActive } = req.body || {};

    if (typeof isActive !== 'boolean') {
      return next(new AppError('isActive must be true or false', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(
        new AppError('Admin accounts cannot be modified through this endpoint', 403)
      );
    }

    user.isActive = isActive;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserByAdmin = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(
        new AppError('Admin accounts cannot be deleted through this endpoint', 403)
      );
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
};