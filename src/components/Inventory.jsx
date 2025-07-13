import React, { useEffect, useState } from 'react';
import { dbService } from '../services/indexeddb';
import { useNavigate } from 'react-router-dom';

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [looseItems, setLooseItems] = useState([]);
  const [filteredLooseItems, setFilteredLooseItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [addProductForm, setAddProductForm] = useState({ name: '', barcode: '', price: '' });
  const [addLooseForm, setAddLooseForm] = useState({ name: '', category: '', pricePerKg: '' });
  const [addProductSuccess, setAddProductSuccess] = useState(false);
  const [addLooseSuccess, setAddLooseSuccess] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddLoose, setShowAddLoose] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allProducts = await dbService.getProducts();
      const allLoose = await dbService.getLooseItems();
      setProducts(allProducts || []);
      setLooseItems(allLoose || []);
      setFilteredLooseItems(allLoose || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredLooseItems(looseItems);
    } else {
      const filtered = looseItems.filter(item => item.category === selectedCategory);
      setFilteredLooseItems(filtered);
    }
  }, [selectedCategory, looseItems]);

  const categories = ['all', ...new Set(looseItems.map(item => item.category).filter(Boolean))];
  const looseCategories = [...new Set(looseItems.map(item => item.category).filter(Boolean))];

  // Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!addProductForm.name || !addProductForm.barcode || !addProductForm.price) return;
    const newProduct = {
      id: Date.now().toString(),
      name: addProductForm.name,
      barcode: addProductForm.barcode,
      price: parseFloat(addProductForm.price)
    };
    await dbService.init();
    const tx = dbService.db.transaction(['products'], 'readwrite');
    tx.objectStore('products').add(newProduct);
    tx.oncomplete = async () => {
      const allProducts = await dbService.getProducts();
      setProducts(allProducts || []);
      setAddProductForm({ name: '', barcode: '', price: '' });
      setAddProductSuccess(true);
      setTimeout(() => {
        setAddProductSuccess(false);
        setShowAddProduct(false);
      }, 1200);
    };
  };

  // Add Loose Item Handler
  const handleAddLoose = async (e) => {
    e.preventDefault();
    if (!addLooseForm.name || !addLooseForm.category || !addLooseForm.pricePerKg) return;
    const newLoose = {
      id: Date.now().toString(),
      name: addLooseForm.name,
      category: addLooseForm.category,
      pricePerKg: parseFloat(addLooseForm.pricePerKg)
    };
    await dbService.init();
    const tx = dbService.db.transaction(['looseItems'], 'readwrite');
    tx.objectStore('looseItems').add(newLoose);
    tx.oncomplete = async () => {
      const allLoose = await dbService.getLooseItems();
      setLooseItems(allLoose || []);
      setFilteredLooseItems(allLoose || []);
      setAddLooseForm({ name: '', category: '', pricePerKg: '' });
      setAddLooseSuccess(true);
      setTimeout(() => {
        setAddLooseSuccess(false);
        setShowAddLoose(false);
      }, 1200);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-8">
      <div className="max-w-6xl w-full mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="mb-6 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold"
        >
          ← Back to Home
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Inventory</h1>
        {loading ? (
          <div className="text-center text-gray-600">Loading inventory...</div>
        ) : (
          <div className="md:grid md:grid-cols-2 gap-8 flex flex-col">
            {/* Loose Items Section (Left) */}
            <div className="mb-10 bg-white rounded-xl shadow p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Loose Items</h2>
                <button
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold"
                  onClick={() => setShowAddLoose(v => !v)}
                >
                  {showAddLoose ? 'Cancel' : 'Add Loose Item'}
                </button>
              </div>
              {showAddLoose && (
                <form className="flex flex-col gap-4 mb-4 md:grid md:[grid-template-columns:1fr_1fr_1fr_auto]" onSubmit={handleAddLoose}>
                  <input
                    type="text"
                    placeholder="Name"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                    value={addLooseForm.name}
                    onChange={e => setAddLooseForm({ ...addLooseForm, name: e.target.value })}
                    required
                  />
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                    value={addLooseForm.category}
                    onChange={e => setAddLooseForm({ ...addLooseForm, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {looseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price per kg"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                    value={addLooseForm.pricePerKg}
                    onChange={e => setAddLooseForm({ ...addLooseForm, pricePerKg: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                  <button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold md:justify-self-end"
                  >
                    Add
                  </button>
                </form>
              )}
              {addLooseSuccess && <div className="text-green-600 mb-2">Loose item added!</div>}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-700">Filter:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              {filteredLooseItems.length === 0 ? (
                <div className="text-gray-500">
                  {selectedCategory === 'all' ? 'No loose items found.' : `No items found in ${selectedCategory} category.`}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {filteredLooseItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col">
                      <div className="font-bold text-lg text-gray-800 mb-1">{item.name}</div>
                      {item.category && <div className="text-gray-500 text-xs mb-1">Category: {item.category}</div>}
                      <div className="text-gray-700 text-sm">Price per kg: ₹{item.pricePerKg || item.defaultPricePerKg}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Products Section (Right) */}
            <div className="mb-10 bg-white rounded-xl shadow p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Products</h2>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                  onClick={() => setShowAddProduct(v => !v)}
                >
                  {showAddProduct ? 'Cancel' : 'Add Product'}
                </button>
              </div>
              {showAddProduct && (
                <form className="flex flex-col gap-4 mb-4 md:grid md:[grid-template-columns:1fr_1fr_1fr_auto]" onSubmit={handleAddProduct}>
                  <input
                    type="text"
                    placeholder="Name"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                    value={addProductForm.name}
                    onChange={e => setAddProductForm({ ...addProductForm, name: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Barcode"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                    value={addProductForm.barcode}
                    onChange={e => setAddProductForm({ ...addProductForm, barcode: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                    value={addProductForm.price}
                    onChange={e => setAddProductForm({ ...addProductForm, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold md:justify-self-end"
                  >
                    Add
                  </button>
                </form>
              )}
              {addProductSuccess && <div className="text-green-600 mb-2">Product added!</div>}
              {products.length === 0 ? (
                <div className="text-gray-500">No products found.</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {products.map((product, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col">
                      <div className="font-bold text-lg text-gray-800 mb-1">{product.name}</div>
                      <div className="text-gray-600 text-sm mb-1">Barcode: {product.barcode}</div>
                      {product.category && <div className="text-gray-500 text-xs mb-1">Category: {product.category}</div>}
                      <div className="text-gray-700 text-sm">Price: ₹{product.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 