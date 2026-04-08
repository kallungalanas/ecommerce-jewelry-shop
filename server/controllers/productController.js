// server/controllers/productController.js
import Product from '../models/Product.js'

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { limit, featured, sort } = req.query
    
    let query = {}
    if (featured === 'true') {
      query.featured = true
    }

    let sortOptions = {}
    if (sort === 'price-low') {
      sortOptions.price = 1
    } else if (sort === 'price-high') {
      sortOptions.price = -1
    } else if (sort === 'newest') {
      sortOptions.createdAt = -1
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit) || 0)

    res.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ message: 'Search query required' })
    }

    const products = await Product.find({
      $text: { $search: q }
    })

    res.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params

    const products = await Product.find({
      category: new RegExp(category, 'i')
    })

    res.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Filter products
// @route   GET /api/products/filter
// @access  Public
export const filterProducts = async (req, res) => {
  try {
    const { category, metalType, priceRange } = req.query

    let query = {}

    if (category) {
      query.category = new RegExp(category, 'i')
    }

    if (metalType) {
      query.metalType = new RegExp(metalType, 'i')
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      query.price = { $gte: min, $lte: max }
    }

    const products = await Product.find(query)

    res.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle uploaded images (replace images array)
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/images/${file.filename}`);
    } else {
      productData.images = [];
    }

    // Parse number fields
    productData.price = parseFloat(productData.price);
    productData.weight = parseFloat(productData.weight);
    productData.stock = parseInt(productData.stock);

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle uploaded images (replace existing - per requirement)
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/images/${file.filename}`);
    }
    // If no files, req.body.images will be undefined, mongoose ignores unset fields for arrays? But to replace empty, if client sends empty array ok.

    // Parse numbers
    if (productData.price !== undefined) productData.price = parseFloat(productData.price);
    if (productData.weight !== undefined) productData.weight = parseFloat(productData.weight);
    if (productData.stock !== undefined) productData.stock = parseInt(productData.stock);
    if (productData.featured !== undefined) productData.featured = Boolean(productData.featured);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}