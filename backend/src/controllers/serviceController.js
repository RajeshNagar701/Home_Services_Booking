const { Service, Provider, Review, Category } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { PROVIDER_STATUS } = require('../config/constants');

/**
 * @desc    Search and filter services
 * @route   GET /api/services
 * @access  Public
 */
const getAllServices = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      minPrice,
      maxPrice,
      sort = 'rating',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      // Find category by slug or id
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }]
      });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Determine sort
    let sortObj = { rating: -1, createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { totalBookings: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    let servicesQuery = Service.find(query)
      .populate('category', 'name slug icon')
      .populate('provider', 'businessName rating totalReviews verificationStatus serviceAreas')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const [services, total] = await Promise.all([
      servicesQuery,
      Service.countDocuments(query)
    ]);

    // Optional city filter on provider
    let filteredServices = services;
    if (city) {
      filteredServices = services.filter((srv) =>
        srv.provider && srv.provider.serviceAreas &&
        srv.provider.serviceAreas.some((area) => area.city.toLowerCase() === city.toLowerCase())
      );
    }

    return paginatedResponse(res, 'Services fetched successfully.', filteredServices, total, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single service by ID or slug
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const service = await Service.findOne(isObjectId ? { _id: id } : { slug: id })
      .populate('category', 'name slug icon')
      .populate('provider', 'businessName description rating totalReviews serviceAreas commissionRate');

    if (!service) {
      return next(new AppError('Service not found.', 404));
    }

    // Fetch recent reviews for this service
    const reviews = await Review.find({ service: service._id, isPublished: true })
      .populate('customer', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, 'Service details fetched.', {
      service,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Create a new service offering
 * @route   POST /api/services
 * @access  Private (Provider)
 */
const createService = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return next(new AppError('Provider profile not found for this account.', 404));
    }

    // Business Rule: Only approved service providers can publish services!
    if (provider.verificationStatus !== PROVIDER_STATUS.APPROVED) {
      return next(
        new AppError(
          'Your provider account is currently pending verification or rejected. You can only publish services once approved by Super Admin.',
          403
        )
      );
    }

    const {
      title,
      category,
      description,
      price,
      discountPrice,
      durationMinutes,
      coverImage,
      galleryImages,
      includedFeatures,
      excludedFeatures
    } = req.body;

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;

    const service = await Service.create({
      provider: provider._id,
      category,
      title,
      slug,
      description,
      price,
      discountPrice: discountPrice || 0,
      durationMinutes: durationMinutes || 60,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      galleryImages: galleryImages || [],
      includedFeatures: Array.isArray(includedFeatures) ? includedFeatures : (includedFeatures ? [includedFeatures] : []),
      excludedFeatures: Array.isArray(excludedFeatures) ? excludedFeatures : (excludedFeatures ? [excludedFeatures] : []),
      isActive: true
    });

    return successResponse(res, 'Service created successfully.', service, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Update own service
 * @route   PUT /api/services/:id
 * @access  Private (Provider)
 */
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findOne({ user: req.user._id });

    const service = await Service.findOne({ _id: id, provider: provider._id });
    if (!service) {
      return next(new AppError('Service not found or you are not authorized to edit it.', 404));
    }

    const fields = [
      'title',
      'category',
      'description',
      'price',
      'discountPrice',
      'durationMinutes',
      'coverImage',
      'galleryImages',
      'includedFeatures',
      'excludedFeatures',
      'isActive'
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        service[f] = req.body[f];
      }
    });

    await service.save();

    return successResponse(res, 'Service updated successfully.', service);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Delete own service
 * @route   DELETE /api/services/:id
 * @access  Private (Provider)
 */
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findOne({ user: req.user._id });

    const service = await Service.findOneAndDelete({ _id: id, provider: provider._id });
    if (!service) {
      return next(new AppError('Service not found or you are not authorized to delete it.', 404));
    }

    return successResponse(res, 'Service deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Get all services for current provider
 * @route   GET /api/services/my-services
 * @access  Private (Provider)
 */
const getMyServices = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return next(new AppError('Provider profile not found.', 404));
    }

    const services = await Service.find({ provider: provider._id })
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Provider services fetched.', services);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices
};
