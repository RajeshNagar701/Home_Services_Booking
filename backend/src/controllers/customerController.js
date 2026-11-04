const { Address, Customer, User } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get customer addresses
 * @route   GET /api/customers/addresses
 * @access  Private (Customer)
 */
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return successResponse(res, 'Addresses fetched.', addresses);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add new address
 * @route   POST /api/customers/addresses
 * @access  Private (Customer)
 */
const addAddress = async (req, res, next) => {
  try {
    const { streetAddress, landmark, city, state, pincode, contactPhone, type, isDefault } = req.body;

    if (!streetAddress || !city || !state || !pincode || !contactPhone) {
      return next(new AppError('Please fill in all required address fields.', 400));
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      streetAddress,
      landmark: landmark || '',
      city,
      state,
      pincode,
      contactPhone,
      type: type || 'home',
      isDefault: Boolean(isDefault)
    });

    await Customer.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { savedAddresses: address._id } },
      { upsert: true }
    );

    return successResponse(res, 'Address added successfully.', address, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/customers/addresses/:id
 * @access  Private (Customer)
 */
const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { streetAddress, landmark, city, state, pincode, contactPhone, type, isDefault } = req.body;

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      return next(new AppError('Address not found.', 404));
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    if (streetAddress) address.streetAddress = streetAddress;
    if (landmark !== undefined) address.landmark = landmark;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (contactPhone) address.contactPhone = contactPhone;
    if (type) address.type = type;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    return successResponse(res, 'Address updated successfully.', address);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/customers/addresses/:id
 * @access  Private (Customer)
 */
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) {
      return next(new AppError('Address not found.', 404));
    }

    await Customer.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { savedAddresses: address._id } }
    );

    return successResponse(res, 'Address deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
