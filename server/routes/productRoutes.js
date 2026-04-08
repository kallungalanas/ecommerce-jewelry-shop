// server/routes/productRoutes.js
import express from 'express'
import {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  filterProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { uploadImages } from '../middleware/upload.js'

const router = express.Router()

router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/filter', filterProducts)
router.get('/category/:category', getProductsByCategory)
router.get('/:id', getProductById)

// Admin routes
router.post('/', protect, admin, uploadImages, createProduct)
router.put('/:id', protect, admin, uploadImages, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

export default router