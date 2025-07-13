import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dbService } from '../services/indexeddb';
import { BarcodeService } from '../services/barcode';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, User, Phone, Printer } from 'lucide-react';

export const CreateBill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const barcodeService = useRef(null);

  useEffect(() => {
    // Check if we're returning from AddLooseItems with updated bill data
    if (location.state?.billItems) {
      setBillItems(location.state.billItems);
      setCustomerName(location.state.customerName || '');
      setCustomerPhone(location.state.customerPhone || '');
      // Clear the state to prevent re-applying on subsequent renders
      window.history.replaceState({}, document.title);
    }

    // Initialize barcode scanner
    barcodeService.current = new BarcodeService();
    barcodeService.current.initialize(handleBarcodeScan);

    // Load customers for autocomplete
    loadCustomers();

    return () => {
      if (barcodeService.current) {
        barcodeService.current.destroy();
      }
    };
  }, [location.state]);

  const loadCustomers = async () => {
    try {
      const customerList = await dbService.getCustomers();
      setCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleBarcodeScan = (product) => {
    if (product) {
      addItemToBill(product);
    } else {
      // Show toast or alert for unknown barcode
      alert('Product not found for this barcode');
    }
  };

  const addItemToBill = (product) => {
    setBillItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        product.barcode ? item.barcode === product.barcode : item.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Increase quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const updateItemQuantity = (itemId, change) => {
    setBillItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId) => {
    setBillItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return billItems.reduce((total, item) => {
      if (item.isLoose && item.pricePerKg) {
        return total + (item.quantity * item.pricePerKg);
      }
      return total + (item.quantity * item.price);
    }, 0);
  };

  const calculateTotalItems = () => {
    return billItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCustomerNameChange = (value) => {
    setCustomerName(value);
    setShowSuggestions(value.length > 0);
    
    // Auto-fill phone if customer exists
    const existingCustomer = customers.find(c => c.name.toLowerCase() === value.toLowerCase());
    if (existingCustomer && existingCustomer.phone) {
      setCustomerPhone(existingCustomer.phone);
    }
  };

  const selectCustomer = (customer) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone || '');
    setShowSuggestions(false);
  };

  const handleFinishBill = async () => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (billItems.length === 0) {
      alert('Please add items to the bill');
      return;
    }

    const bill = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      items: billItems,
      total: calculateTotal(),
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: new Date()
    };

    try {
      await dbService.saveBill(bill);
      // Navigate to print view
      navigate('/print-bill', { state: { bill } });
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill. Please try again.');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerName.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Create New Bill</h1>
            </div>
            {/* Live Bill Totals - Always Visible */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-xl border border-blue-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Live Bill Summary</div>
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{calculateTotalItems()}</div>
                    <div className="text-xs text-gray-500">Total Items</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Total Amount</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scanning Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Scan Barcodes</h3>
                <p className="text-gray-600 mb-4">Scan product barcodes to add them to the bill</p>
                <div className="bg-blue-50 p-4 rounded-lg inline-block">
                  <p className="text-blue-700 font-medium">Ready to scan...</p>
                </div>
              </div>
              
              {/* Test Barcode Buttons for Demo */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-3">Demo Products (Click to add):</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['8901030893999', '8901030849316', '8901719100734', '8901030856495', '8901030830574'].map(barcode => (
                    <button
                      key={barcode}
                      onClick={() => barcodeService.current?.simulateScan(barcode)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                    >
                      {barcode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Loose Items Button */}
            <button
              onClick={() => navigate('/add-loose-items', { state: { billItems, customerName, customerPhone } })}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Add Loose Items (Rice, Vegetables, etc.)
            </button>
          </div>

          {/* Bill Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Bill</h3>
              
              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {billItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items added yet</p>
                ) : (
                  <>
                    {/* Bill Items Table */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 mb-2 pb-2 border-b border-gray-300">
                        <div>Item</div>
                        <div className="text-center">Qty</div>
                        <div className="text-right">Rate</div>
                        <div className="text-right">Total</div>
                      </div>
                    </div>
                    
                    {billItems.map((item, index) => (
                      <div key={`${item.id}-${item.barcode || ''}-${index}`} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center flex-1">
                            {item.image && <span className="mr-2 text-lg">{item.image}</span>}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-800 leading-tight">{item.name}</h4>
                              {item.category && (
                                <div className="text-xs text-gray-500">{item.category}</div>
                              )}
                              {item.isLoose && (
                                <div className="text-xs text-blue-600 font-medium">Loose Item</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 items-center">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateItemQuantity(item.id, item.isLoose ? -0.1 : -1)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-1 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-medium text-xs text-center min-w-[2.5rem]">
                              {item.quantity}{item.isLoose ? 'kg' : ''}
                            </span>
                            <button
                              onClick={() => updateItemQuantity(item.id, item.isLoose ? 0.1 : 1)}
                              className="bg-green-100 hover:bg-green-200 text-green-700 rounded-full p-1 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {/* Rate */}
                          <div className="text-right">
                            <div className="text-xs text-gray-600 font-medium">
                              ₹{(item.isLoose && item.pricePerKg ? item.pricePerKg : item.price).toFixed(2)}
                              {item.isLoose ? '/kg' : ''}
                            </div>
                          </div>
                          
                          {/* Total */}
                          <div className="text-right">
                            <div className="font-semibold text-green-600 text-sm">
                              ₹{(item.quantity * (item.isLoose && item.pricePerKg ? item.pricePerKg : item.price)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Bill Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Total Items:</span>
                        <span className="text-sm font-bold text-gray-800">{calculateTotalItems()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Customer Form */}
              {!showCustomerForm && billItems.length > 0 && (
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors mb-4"
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Add Customer Details
                </button>
              )}

              {showCustomerForm && (
                <div className="border-t pt-4 mb-4">
                  <div className="relative mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => handleCustomerNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter customer name"
                    />
                    
                    {/* Customer Suggestions */}
                    {showSuggestions && filteredCustomers.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-32 overflow-y-auto shadow-lg">
                        {filteredCustomers.slice(0, 5).map(customer => (
                          <button
                            key={customer.name}
                            onClick={() => selectCustomer(customer)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{customer.name}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              )}

              {/* Total and Finish */}
              {billItems.length > 0 && (
                <>
                  <div className="border-t pt-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Ready to Print</span>
                        <span className="text-sm text-blue-600">{calculateTotalItems()} items</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-gray-800">Final Total:</span>
                        <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleFinishBill}
                    disabled={!customerName.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    <Printer className="h-5 w-5 inline mr-2" />
                    Finish & Print Bill
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 