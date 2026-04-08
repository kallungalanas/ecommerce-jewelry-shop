import React, { useState } from 'react'
import { ShoppingCart, Heart, Shield, Award, Truck } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const ProductDetails = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
const { addToCart } = useCart()

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image Gallery */}
      <div>
        <div className="aspect-square bg-dark-elevated rounded-lg overflow-hidden mb-4">
          <img
            src={product.images?.[selectedImage] ? `${IMAGE_BASE_URL}${product.images[selectedImage]}` : '/placeholder-jewelry.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {product.images?.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 ${
                selectedImage === index ? 'border-gold' : 'border-dark-border'
              }`}
            >
              <img src={image.startsWith('http') ? image : `${IMAGE_BASE_URL}${image}`} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <p className="text-sm text-gold uppercase tracking-wider mb-2">{product.category}</p>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        
        <div className="flex items-baseline gap-4 mb-6">
          <p className="text-4xl font-bold text-gold">₹{product.price?.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">incl. all taxes</p>
        </div>

        <p className="text-gray-300 mb-6">{product.description}</p>

        {/* Specifications */}
        <div className="bg-dark-elevated rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-4">Specifications</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Metal Type</p>
              <p className="font-medium">{product.metalType}</p>
            </div>
            <div>
              <p className="text-gray-400">Purity</p>
              <p className="font-medium">{product.purity}</p>
            </div>
            <div>
              <p className="text-gray-400">Weight</p>
              <p className="font-medium">{product.weight}g</p>
            </div>
            <div>
              <p className="text-gray-400">Dimensions</p>
              <p className="font-medium">{product.specifications?.dimensions || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="font-medium">Quantity:</label>
          <div className="flex items-center border border-dark-border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-dark-elevated"
            >
              -
            </button>
            <span className="px-6 py-2 border-x border-dark-border">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-dark-elevated"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-gold hover:bg-gold-dark text-dark-bg font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
          <button className="border border-gold text-gold hover:bg-gold hover:text-dark-bg p-3 rounded-lg transition-colors">
            <Heart size={20} />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="flex flex-col items-center gap-2">
            <Shield className="text-gold" size={24} />
            <p className="text-gray-400">Certified Authentic</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Award className="text-gold" size={24} />
            <p className="text-gray-400">Lifetime Service</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Truck className="text-gold" size={24} />
            <p className="text-gray-400">Free Shipping</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
