import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { dbService } from './services/indexeddb';
import { Home } from './components/Home';
import { CreateBill } from './components/CreateBill';
import { AddLooseItems } from './components/AddLooseItems';
import { BillHistory } from './components/BillHistory';
import { PrintBill } from './components/PrintBill';
import { Inventory } from './components/Inventory';

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await dbService.init();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Even if DB fails, let's show the app
        setDbInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  if (!dbInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-bill" element={<CreateBill />} />
        <Route path="/add-loose-items" element={<AddLooseItems />} />
        <Route path="/bill-history" element={<BillHistory />} />
        <Route path="/print-bill" element={<PrintBill />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 