// client/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, ShoppingBag, X, Save, Eye } from 'lucide-react';
import { productAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';

const AdminPanel = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login as admin to access this page');
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Rings',
    metalType: 'Gold',
    purity: '22K',
    weight: '',
    price: '',
    stock: '',
    featured: false
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]); 

  const categories = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Pendants', 'Sets'];
  const metalTypes = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'];
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Fetch products
  const fetchProducts = async () => {
    try {
      setError('');
      const response = await productAPI.getAllProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      if (error.response?.status === 403) {
        alert('Access denied. Please login as admin.');
        navigate('/login');
      }
    }
  };

  // Fetch orders - FIXED
  const fetchOrders = async () => {
    try {
      setError('');
      console.log('Fetching orders...');
      const response = await orderAPI.getAllOrders();
      console.log('Orders response:', response.data);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load orders: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      if (activeTab === 'products') {
        fetchProducts();
      } else if (activeTab === 'orders') {
        fetchOrders();
      }
    }
  }, [isAuthenticated, user, activeTab]);

const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('metalType', productForm.metalType);
      formData.append('purity', productForm.purity);
      formData.append('weight', productForm.weight);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('featured', productForm.featured ? 'true' : 'false');
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, formData);
        alert('Product updated successfully!');
      } else {
        await productAPI.createProduct(formData);
        alert('Product added successfully!');
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.message || 'Error saving product. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = selectedFiles.length;
    if (currentCount + files.length > 5) {
      alert('Maximum 5 images allowed!');
      return;
    }
    const newPreviews = [];
    const newFiles = [];
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size 5MB.`);
        continue;
      }
      newPreviews.push(URL.createObjectURL(file));
      newFiles.push(file);
    }
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeImagePreview = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: 'Rings',
      metalType: 'Gold',
      purity: '22K',
      weight: '',
      price: '',
      stock: '',
      featured: false
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const handleEdit = (product) => {
    setProductForm(product);
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Don't render if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">You need admin privileges to access this page</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gold text-dark-bg px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gold">Patil Jewellers Admin</h1>
            <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 m-6">
          {error}
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-dark-card min-h-screen border-r border-dark-border">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'products' ? 'bg-gold text-dark-bg' : 'text-gray-300 hover:bg-dark-elevated'
              }`}
            >
              <Package size={20} />
              <span>Products</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders' ? 'bg-gold text-dark-bg' : 'text-gray-300 hover:bg-dark-elevated'
              }`}
            >
              <ShoppingBag size={20} />
              <span>Orders ({orders.length})</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-gold hover:bg-gold-dark text-dark-bg px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                  <Plus size={20} />
                  Add Product
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
                    <div className="aspect-square bg-dark-elevated flex items-center justify-center">
                      {product.images?.[0] ? (
<img src={`${IMAGE_BASE_URL}${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={48} className="text-gray-500" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        {product.featured && (
                          <span className="bg-gold text-dark-bg text-xs px-2 py-1 rounded font-medium">Featured</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{product.category} • {product.metalType}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gold font-bold">₹{product.price?.toLocaleString()}</span>
                        <span className="text-sm text-gray-400">Stock: {product.stock}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-gold hover:bg-gold-dark text-dark-bg px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Order Management</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={64} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="bg-dark-card rounded-lg border border-dark-border p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">Order #{order._id.slice(-8)}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="bg-dark-elevated border border-dark-border rounded px-3 py-1 text-sm"
                        >
                          {orderStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="border-t border-dark-border pt-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-400">Customer</p>
                            <p className="font-medium">{order.user?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-400">{order.user?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Total Amount</p>
                            <p className="font-bold text-gold text-xl">₹{order.totalAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-2">Items ({order.items?.length || 0}):</p>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-300">
                              • {item.name} x{item.quantity} - ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-gold hover:text-gold-dark text-sm flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Full Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-border">
            <div className="flex justify-between items-center p-6 border-b border-dark-border">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-gold"
                      placeholder="e.g., Gold Diamond Ring"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 h-24 focus:outline-none focus:border-gold"
                      placeholder="Product description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-gold"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Metal Type *</label>
                    <select
                      value={productForm.metalType}
                      onChange={(e) => setProductForm({...productForm, metalType: e.target.value})}
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-gold"
                    >
                      {metalTypes.map(metal => (
                        <option key={metal} value={metal}>{metal}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Purity *</label>
                    <input
                      type="text"
                      value={productForm.purity}
                      onChange={(e) => setProductForm({...productForm, purity: e.target.value})}
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-gold"
                      placeholder="e.g., 22K, 925"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Weight (grams) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({...productForm, weight: parseFloat(e.target.value)})}
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-gold"
                      placeholder="e.g., 5.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseInt(e.target.value)})}
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-gold"
                      placeholder="e.g., 45000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded px-4 py-2 focus:outline-none focus:border-gold"
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Mark as Featured Product</span>
                    </label>
                  </div>
                </div>

                {/* Images Section */}
                <div className="col-span-2 mt-6">
                  <label className="block text-sm font-medium mb-4">Product Images</label>
                  <div className="relative border-2 border-dashed border-dark-border rounded-lg p-8 text-center hover:border-gold transition-colors cursor-pointer" 
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImageChange({ target: { files: e.dataTransfer.files } });
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Plus className="w-12 h-12 text-gray-400" />
                      <span className="font-medium">Click or drag & drop to add images</span>
                      <span className="text-xs text-gray-500">Up to 5 images • JPG, PNG, WebP • Max 5MB each</span>
                    </label>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} className="w-full h-20 object-cover rounded-lg shadow-md" />
                          <button 
                            onClick={() => removeImagePreview(index)}
                            className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editingProduct?.images?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">Current: {editingProduct.images.length} image(s). New uploads will replace them.</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gold hover:bg-gold-dark text-dark-bg py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 bg-dark-elevated hover:bg-dark-border text-white py-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-card rounded-lg max-w-3xl w-full border border-dark-border my-8">
            <div className="flex justify-between items-center p-6 border-b border-dark-border">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Order ID</p>
                  <p className="font-medium">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="font-medium capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p className="font-medium uppercase">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-dark-border pt-4">
                <h4 className="font-bold mb-3 text-gold">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="font-medium">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="font-medium">{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-dark-border pt-4">
                <h4 className="font-bold mb-3 text-gold">Shipping Address</h4>
                {selectedOrder.shippingAddress ? (
                  <div className="bg-dark-elevated p-4 rounded-lg">
                    <p className="font-medium mb-1">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-gray-300">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-gray-300">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-300">{selectedOrder.shippingAddress.country}</p>
                    <p className="text-gray-400 text-sm mt-2">Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">No shipping address available</p>
                )}
              </div>

              {/* Order Items */}
              <div className="border-t border-dark-border pt-4">
                <h4 className="font-bold mb-3 text-gold">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 bg-dark-elevated p-3 rounded-lg">
                      {item.image && (
                        <img 
                          src={item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image}`} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-400">Price: ₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.orderNotes && (
                <div className="border-t border-dark-border pt-4">
                  <h4 className="font-bold mb-2 text-gold">Order Notes</h4>
                  <p className="text-gray-300 bg-dark-elevated p-3 rounded-lg">{selectedOrder.orderNotes}</p>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-dark-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-gold">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;