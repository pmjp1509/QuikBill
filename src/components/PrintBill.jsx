import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';

export const PrintBill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bill } = location.state || {};

  useEffect(() => {
    // Auto-open print dialog after component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!bill) {
    navigate('/');
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalItems = bill.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden in Print */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/create-bill')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Print Bill</h1>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Printer className="h-4 w-4 inline mr-2" />
              Print Again
            </button>
          </div>
        </div>
      </div>

      {/* Bill Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 print:p-0 print:max-w-none">
        <div className="bg-white rounded-xl shadow-sm print:shadow-none print:rounded-none">
          {/* Print Styles */}
          <style>{`
            @media print {
              @page {
                margin: 0.5in;
                size: A4;
              }
              
              body {
                font-family: 'Courier New', monospace;
                line-height: 1.4;
              }
              
              .print-bill {
                max-width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
              }
              
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="print-bill p-8 print:p-6">
            {/* Header */}
            <div className="text-center mb-8 print:mb-6">
              <h1 className="text-3xl print:text-2xl font-bold text-gray-800 mb-2">QuickBill Pro</h1>
              <p className="text-gray-600 print:text-sm">Your Trusted Neighborhood Store</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  📍 123 Main Street, City, State - 12345 | 📞 +91 9876543210
                </p>
              </div>
            </div>

            {/* Bill Info */}
            <div className="flex justify-between items-start mb-6 print:mb-4 text-sm">
              <div>
                <h2 className="text-xl print:text-lg font-bold text-gray-800 mb-2">BILL RECEIPT</h2>
                <p><strong>Bill No:</strong> #{bill.id}</p>
                <p><strong>Date:</strong> {formatDate(bill.date)}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 mb-1">CUSTOMER DETAILS</h3>
                <p><strong>Name:</strong> {bill.customerName}</p>
                {bill.customerPhone && (
                  <p><strong>Phone:</strong> {bill.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 print:mb-4">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Item</th>
                    <th className="border border-gray-300 p-2 text-center text-sm font-semibold">Qty</th>
                    <th className="border border-gray-300 p-2 text-right text-sm font-semibold">Rate</th>
                    <th className="border border-gray-300 p-2 text-right text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2 text-sm">
                        <div className="flex items-center">
                          {item.image && <span className="mr-2 text-lg">{item.image}</span>}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.category && (
                              <div className="text-xs text-gray-500">{item.category}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2 text-center text-sm">
                        {item.quantity}{item.isLoose ? 'kg' : ''}
                      </td>
                      <td className="border border-gray-300 p-2 text-right text-sm">
                        ₹{(item.isLoose && item.pricePerKg ? item.pricePerKg : item.price).toFixed(2)}
                        {item.isLoose ? '/kg' : ''}
                      </td>
                      <td className="border border-gray-300 p-2 text-right text-sm font-medium">
                        ₹{(item.quantity * (item.isLoose && item.pricePerKg ? item.pricePerKg : item.price)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="border-t-2 border-gray-400 pt-4 print:pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total Items:</span>
                <span className="text-sm font-bold">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl print:text-lg font-bold">TOTAL AMOUNT:</span>
                <span className="text-xl print:text-lg font-bold text-green-600">₹{bill.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 print:mt-6 pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Thank you for shopping with us!</p>
              <p className="text-xs text-gray-500">
                This is a computer generated bill. No signature required.
              </p>
              <div className="mt-4 print:mt-3">
                <p className="text-xs text-gray-500">
                  Bill generated on {new Date().toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Hidden in Print */}
        <div className="mt-6 text-center print:hidden">
          <div className="space-x-4">
            <button
              onClick={() => navigate('/create-bill')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create New Bill
            </button>
            <button
              onClick={() => navigate('/bill-history')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 