import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const ProductCard = ({ product }) => {
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(product)
  }

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="bg-dark-card rounded-lg overflow-hidden border border-dark-border hover:border-gold transition-all duration-300 hover:shadow-lg hover:shadow-gold/20">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-dark-elevated">
          <img
            src={product.images?.[0] ? `${IMAGE_BASE_URL}${product.images[0]}` : '/placeholder-jewelry.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Wishlist Button */}
          <button 
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 bg-dark-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-gold hover:text-dark-bg transition-colors"
          >
            <Heart size={18} />
          </button>
          {/* Badge */}
          {product.featured && (
            <span className="absolute top-3 left-3 bg-gold text-dark-bg text-xs font-bold px-3 py-1 rounded-full">
              FEATURED
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="font-medium text-gray-100 mb-2 line-clamp-2">{product.name}</h3>
          
          {/* Specifications */}
          <div className="flex gap-4 text-xs text-gray-400 mb-3">
            <span>{product.metalType}</span>
            <span>•</span>
            <span>{product.weight}g</span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gold">₹{product.price?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">incl. GST</p>
            </div>
            <button 
              onClick={handleAddToCart}
              className="bg-gold hover:bg-gold-dark text-dark-bg p-2 rounded-lg transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
