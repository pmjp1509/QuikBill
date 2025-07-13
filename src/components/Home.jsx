import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, History, Store } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">QuickBill Pro</h1>
          </div>
          <p className="text-xl text-gray-600">Offline Billing Solution for Your Shop</p>
        </div>

        {/* Main Actions */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Create Bill */}
          <div 
            onClick={() => navigate('/create-bill')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4 border-blue-500"
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">Create Bill</h2>
            </div>
            <p className="text-gray-600 text-lg mb-6">
              Start a new billing session. Scan barcodes, add loose items, and generate receipts instantly.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700 font-medium">Ready to scan barcodes and create bills</p>
            </div>
          </div>

          {/* Bill History */}
          <div 
            onClick={() => navigate('/bill-history')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4 border-green-500"
          >
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <History className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">Bill History</h2>
            </div>
            <p className="text-gray-600 text-lg mb-6">
              View past bills, search by customer name, and reprint receipts whenever needed.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-700 font-medium">Access all your billing records</p>
            </div>
          </div>

          {/* Inventory */}
          <div 
            onClick={() => navigate('/inventory')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4 border-yellow-500"
          >
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full">
                <span className="text-yellow-600">  </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">Inventory</h2>
            </div>
            <p className="text-gray-600 text-lg mb-6">
              View all products and loose items in your inventory. Manage stock and details easily.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-700 font-medium">Check and manage your inventory</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Offline Ready</h4>
              <p className="text-gray-600 text-sm">Works without internet connection</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">🖨️</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Print Ready</h4>
              <p className="text-gray-600 text-sm">Print professional receipts instantly</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="bg-teal-100 p-3 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Smart Storage</h4>
              <p className="text-gray-600 text-sm">All data saved locally and securely</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 