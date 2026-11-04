const { Category, Service } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all active categories with service count
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    if (require('mongoose').connection.readyState !== 1) {
      const { SERVICE_CATEGORIES } = require('../../seed/demo_accounts');
      const mapped = SERVICE_CATEGORIES.map((c, idx) => ({
        _id: `cat-${idx + 1}`,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        servicesCount: 5,
        description: c.description
      }));
      return successResponse(res, 'Categories fetched successfully.', mapped);
    }

    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });

    // Attach active service counts to each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Service.countDocuments({ category: cat._id, isActive: true });
        return {
          ...cat.toObject(),
          servicesCount: count
        };
      })
    );

    return successResponse(res, 'Categories fetched successfully.', categoriesWithCounts);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single category by slug with its services
 * @route   GET /api/categories/:slug
 * @access  Public
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true });

    if (!category) {
      return next(new AppError('Category not found.', 404));
    }

    const services = await Service.find({ category: category._id, isActive: true })
      .populate('provider', 'businessName rating totalReviews serviceAreas')
      .sort({ rating: -1 });

    return successResponse(res, 'Category details fetched.', {
      category,
      services
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, image, description, sortOrder } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return next(new AppError('A category with this name or slug already exists.', 409));
    }

    const category = await Category.create({
      name,
      slug,
      icon: icon || 'bi-gear',
      image: image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
      description: description || '',
      sortOrder: sortOrder || 0
    });

    return successResponse(res, 'Category created successfully.', category, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, image, description, isActive, sortOrder } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('Category not found.', 404));
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (icon !== undefined) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;

    await category.save();

    return successResponse(res, 'Category updated successfully.', category);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activeServicesCount = await Service.countDocuments({ category: id });

    if (activeServicesCount > 0) {
      return next(
        new AppError(`Cannot delete category because it has ${activeServicesCount} associated services.`, 400)
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return next(new AppError('Category not found.', 404));
    }

    return successResponse(res, 'Category deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
