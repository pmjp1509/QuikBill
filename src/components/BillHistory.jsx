import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/indexeddb';
import { ArrowLeft, Search, Printer, Calendar, User, Phone, Download } from 'lucide-react';

export const BillHistory = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [searchTerm, bills]);

  const loadBills = async () => {
    try {
      const billList = await dbService.getBills();
      setBills(billList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading bills:', error);
      setLoading(false);
    }
  };

  const filterBills = () => {
    if (!searchTerm.trim()) {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(bill =>
        bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerPhone?.includes(searchTerm) ||
        bill.id.includes(searchTerm)
      );
      setFilteredBills(filtered);
    }
  };

  const handlePrintBill = (bill) => {
    navigate('/print-bill', { state: { bill } });
  };

  const exportToCSV = () => {
    if (bills.length === 0) {
      alert('No bills to export');
      return;
    }

    const csvContent = [
      ['Bill ID', 'Customer Name', 'Customer Phone', 'Date', 'Total Items', 'Total Amount'],
      ...bills.map(bill => [
        bill.id,
        bill.customerName,
        bill.customerPhone || '',
        bill.date,
        bill.items.reduce((sum, item) => sum + item.quantity, 0).toString(),
        bill.total.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Bill History</h1>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by customer name, phone, or bill ID..."
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">{bills.length}</div>
            <div className="text-sm text-gray-600">Total Bills</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              ₹{bills.reduce((sum, bill) => sum + bill.total, 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total Sales</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">
              {bills.reduce((sum, bill) => sum + bill.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Items Sold</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-orange-600">
              ₹{bills.length > 0 ? (bills.reduce((sum, bill) => sum + bill.total, 0) / bills.length).toFixed(0) : '0'}
            </div>
            <div className="text-sm text-gray-600">Avg. Bill Value</div>
          </div>
        </div>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'No matching bills found' : 'No bills yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Start creating bills to see them here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBills.map(bill => (
              <div key={bill.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 mr-4">
                        Bill #{bill.id}
                      </h3>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {formatDate(bill.date)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {bill.customerName}
                      </div>
                      {bill.customerPhone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {bill.customerPhone}
                        </div>
                      )}
                      <div>
                        Items: {bill.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{bill.total.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePrintBill(bill)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Printer className="h-4 w-4 inline mr-2" />
                      Print
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {bill.items.slice(0, 3).map((item, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                    {bill.items.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{bill.items.length - 3} more items
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 