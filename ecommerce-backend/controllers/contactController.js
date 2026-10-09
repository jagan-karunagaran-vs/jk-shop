const ContactMessage = require('../models/contactMessage');
const { AppError } = require('../middleware/errorHandler');

const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new AppError('Please provide name, email, subject, and message', 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      user: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      contactMessage: {
        _id: contactMessage._id,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllContactMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactMessage.countDocuments();
    const unreadCount = await ContactMessage.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
      messages,
    });
  } catch (error) {
    next(error);
  }
};

const markMessageAsRead = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  markMessageAsRead,
};