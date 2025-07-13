import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dbService } from '../services/indexeddb';
import { ArrowLeft, Plus, Minus } from 'lucide-react';

export const AddLooseItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { billItems, customerName, customerPhone } = location.state || { billItems: [], customerName: '', customerPhone: '' };
  
  const [looseItems, setLooseItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');

  const categories = [
    { name: 'Rice', icon: '🍚', description: 'All rice varieties' },
    { name: 'Dals', icon: '🫘', description: 'Lentils and pulses' },
    { name: 'Jaggery', icon: '🍯', description: 'Natural sweeteners' },
    { name: 'Spices', icon: '🌶️', description: 'Spices and masalas' },
    { name: 'Vegetables', icon: '🥬', description: 'Fresh vegetables' },
    { name: 'Tamarind', icon: '🌰', description: 'Tamarind varieties' }
  ];

  useEffect(() => {
    loadLooseItems();
    // Initialize default data if not present
    initializeDefaultLooseItems();
  }, []);

  const initializeDefaultLooseItems = async () => {
    try {
      const existingItems = await dbService.getLooseItems();
      if (existingItems.length === 0) {
        // Add default items only when needed
        await dbService.initializeLooseItems();
        loadLooseItems(); // Reload after initialization
      }
    } catch (error) {
      console.error('Error initializing loose items:', error);
    }
  };
  
  const loadLooseItems = async () => {
    try {
      const items = await dbService.getLooseItems();
      setLooseItems(items);
    } catch (error) {
      console.error('Error loading loose items:', error);
    }
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setQuantity('');
    setPricePerKg('');
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setPricePerKg(item.defaultPricePerKg.toString());
    setQuantity('');
  };

  const addQuantity = (amount) => {
    const currentQty = parseFloat(quantity) || 0;
    const addQty = parseFloat(amount);
    setQuantity((currentQty + addQty).toString());
  };

  const updateQuantity = (change) => {
    const currentQty = parseFloat(quantity) || 0;
    const newQty = Math.max(0, currentQty + change);
    setQuantity(newQty.toString());
  };

  const addItemToBill = () => {
    if (!selectedItem || !quantity || !pricePerKg) {
      alert('Please select item, quantity, and price');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(pricePerKg);

    if (qty <= 0 || price <= 0) {
      alert('Please enter valid quantity and price');
      return;
    }

    const newBillItem = {
      id: `loose-${selectedItem.id}-${Date.now()}`,
      name: selectedItem.name,
      price: price,
      quantity: qty,
      category: selectedItem.category,
      image: selectedItem.image,
      isLoose: true,
      pricePerKg: price
    };

    const updatedBillItems = [...billItems, newBillItem];

    // Navigate back to create bill with updated items
    navigate('/create-bill', {
      state: {
        billItems: updatedBillItems,
        customerName,
        customerPhone
      },
      replace: true
    });
  };

  const goBackToCreateBill = () => {
    navigate('/create-bill', { 
      state: { 
        billItems, 
        customerName, 
        customerPhone 
      },
      replace: true 
    });
  };

  const filteredItems = selectedCategory 
    ? looseItems.filter(item => item.category === selectedCategory)
    : [];

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(pricePerKg) || 0;
    return qty * price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={goBackToCreateBill}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Add Loose Items</h1>
              <p className="text-gray-600">Select category → Choose item → Enter quantity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category Selection */}
        {!selectedCategory && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(category => (
                <button
                  key={category.name}
                  onClick={() => selectCategory(category.name)}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 group"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Item Selection */}
        {selectedCategory && !selectedItem && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selectedCategory}</h2>
                <p className="text-gray-600">Choose a {selectedCategory.toLowerCase()} variety</p>
              </div>
              <button
                onClick={() => setSelectedCategory('')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ← Back to Categories
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => selectItem(item)}
                  className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 group"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {item.image}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-tight">
                      {item.name}
                    </h3>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      ₹{item.defaultPricePerKg}/kg
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Price Input */}
        {selectedItem && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selectedItem.name}</h2>
                <p className="text-gray-600">Enter quantity and confirm price</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ← Back to {selectedCategory}
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Selected Item Display */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-5xl mr-4">{selectedItem.image}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{selectedItem.name}</h3>
                    <p className="text-gray-600">Category: {selectedItem.category}</p>
                    <p className="text-green-600 font-medium">Default: ₹{selectedItem.defaultPricePerKg}/kg</p>
                  </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Quick Add Quantities</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => addQuantity('0.25')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                      +250g
                    </button>
                    <button
                      onClick={() => addQuantity('0.5')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                      +500g
                    </button>
                    <button
                      onClick={() => addQuantity('1')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                      +1kg
                    </button>
                  </div>
                </div>

                {/* Manual Quantity Control */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Manual Quantity (kg)</h4>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => updateQuantity(-0.1)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-3 rounded-xl transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <input
                      type="number"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-semibold"
                      placeholder="0.00"
                    />
                    <button
                      onClick={() => updateQuantity(0.1)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 p-3 rounded-xl transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price and Total */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price per kg (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                    placeholder="Enter price per kg"
                  />
                </div>

                {/* Total Calculation */}
                {quantity && pricePerKg && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border border-green-200">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Calculation</h4>
                      <p className="text-gray-600 mb-2">
                        {quantity}kg × ₹{pricePerKg}/kg
                      </p>
                      <div className="text-3xl font-bold text-green-600">
                        ₹{calculateTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add to Bill Button */}
                <button
                  onClick={addItemToBill}
                  disabled={!quantity || !pricePerKg || calculateTotal() <= 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  <Plus className="h-6 w-6 inline mr-2" />
                  Add to Bill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 