class IndexedDBService {
  constructor() {
    this.dbName = 'BillingAppDB';
    this.version = 2; // <--- Increase this number
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      console.log('Opening IndexedDB...');
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
      request.onsuccess = async () => {
        console.log('IndexedDB opened successfully');
        this.db = request.result;
        
        // Ensure sample data is loaded
        try {
          await this.ensureSampleData();
        } catch (error) {
          console.warn('Failed to load sample data:', error);
        }
        
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('IndexedDB onupgradeneeded: creating stores');
        const db = event.target.result;
        const transaction = event.target.transaction || db.transaction;

        // Create object stores if not exist
        if (!db.objectStoreNames.contains('bills')) {
          const billStore = db.createObjectStore('bills', { keyPath: 'id' });
          billStore.createIndex('customerName', 'customerName', { unique: false });
          billStore.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'barcode' });
          productStore.createIndex('name', 'name', { unique: false });
        }
        if (!db.objectStoreNames.contains('looseItems')) {
          const looseStore = db.createObjectStore('looseItems', { keyPath: 'id' });
          looseStore.createIndex('category', 'category', { unique: false });
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'name' });
        }

        // Only use transaction to add initial data, do NOT use this.db or any async/await here!
        // If you want to add initial data, do it synchronously here using transaction.objectStore(...).add(...)
      };
    });
  }

  async ensureSampleData() {
    // Check if products exist, if not add them
    const products = await this.getProductByBarcode('8901030893999');
    if (!products) {
      console.log('Adding sample products to database...');
      await this.initializeLooseItems();
    }
  }

  initializeDefaultData(transaction) {
          // Add sample products with barcodes
      const products = [
        { id: '1', name: 'Coca Cola 500ml', barcode: '8901030893999', price: 40 },
        { id: '2', name: 'Maggi Noodles', barcode: '8901030849316', price: 14 },
        { id: '3', name: 'Parle-G Biscuits', barcode: '8901719100734', price: 20 },
        { id: '4', name: 'Britannia Good Day', barcode: '8901030856495', price: 30 },
        { id: '5', name: 'Amul Milk 1L', barcode: '8901030830574', price: 55 },
      ];

    const productStore = transaction.objectStore('products');
    products.forEach(product => productStore.add(product));
  }

  async initializeLooseItems() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['looseItems', 'products'], 'readwrite');
      const looseStore = transaction.objectStore('looseItems');

      // Check if looseItems already exist
      const getAllRequest = looseStore.getAll();
      getAllRequest.onsuccess = () => {
        if (getAllRequest.result && getAllRequest.result.length > 0) {
          // Already initialized, skip adding
          resolve();
          return;
        }

        // Add default loose items
        const looseItems = [
          // Rice varieties
          { id: '1', name: 'Sona Masoori Rice', category: 'Rice', image: '🍚', defaultPricePerKg: 85 },
          { id: '2', name: 'Basmati Rice', category: 'Rice', image: '🌾', defaultPricePerKg: 120 },
          { id: '3', name: 'Kolam Rice', category: 'Rice', image: '🍙', defaultPricePerKg: 70 },
          { id: '4', name: 'Ponni Rice', category: 'Rice', image: '🌾', defaultPricePerKg: 75 },
          { id: '5', name: 'Brown Rice', category: 'Rice', image: '🍚', defaultPricePerKg: 90 },
          
          // Dal varieties
          { id: '6', name: 'Toor Dal', category: 'Dals', image: '🫘', defaultPricePerKg: 100 },
          { id: '7', name: 'Moong Dal', category: 'Dals', image: '🫛', defaultPricePerKg: 110 },
          { id: '8', name: 'Chana Dal', category: 'Dals', image: '🟡', defaultPricePerKg: 95 },
          { id: '9', name: 'Masoor Dal', category: 'Dals', image: '🔴', defaultPricePerKg: 105 },
          { id: '10', name: 'Urad Dal', category: 'Dals', image: '⚫', defaultPricePerKg: 115 },
          
          // Jaggery varieties
          { id: '11', name: 'Jaggery Powder', category: 'Jaggery', image: '🍯', defaultPricePerKg: 90 },
          { id: '12', name: 'Jaggery Blocks', category: 'Jaggery', image: '🧈', defaultPricePerKg: 85 },
          { id: '13', name: 'Organic Jaggery', category: 'Jaggery', image: '🟤', defaultPricePerKg: 120 },
          
          // Spices
          { id: '14', name: 'Turmeric Powder', category: 'Spices', image: '🟨', defaultPricePerKg: 200 },
          { id: '15', name: 'Red Chili Powder', category: 'Spices', image: '🌶️', defaultPricePerKg: 250 },
          { id: '16', name: 'Coriander Powder', category: 'Spices', image: '🟢', defaultPricePerKg: 180 },
          { id: '17', name: 'Cumin Seeds', category: 'Spices', image: '🤎', defaultPricePerKg: 400 },
          { id: '18', name: 'Black Pepper', category: 'Spices', image: '⚫', defaultPricePerKg: 800 },
          
          // Vegetables
          { id: '19', name: 'Tomatoes', category: 'Vegetables', image: '🍅', defaultPricePerKg: 40 },
          { id: '20', name: 'Onions', category: 'Vegetables', image: '🧅', defaultPricePerKg: 30 },
          { id: '21', name: 'Potatoes', category: 'Vegetables', image: '🥔', defaultPricePerKg: 25 },
          { id: '22', name: 'Carrots', category: 'Vegetables', image: '🥕', defaultPricePerKg: 50 },
          { id: '23', name: 'Green Beans', category: 'Vegetables', image: '🫛', defaultPricePerKg: 60 },
          
          // Tamarind
          { id: '24', name: 'Tamarind', category: 'Tamarind', image: '🌰', defaultPricePerKg: 60 },
          { id: '25', name: 'Seedless Tamarind', category: 'Tamarind', image: '🟤', defaultPricePerKg: 80 },
        ];

        looseItems.forEach(item => {
          const req = looseStore.add(item);
          req.onerror = (event) => {
            console.error('Failed to add loose item:', event.target.error);
          };
        });

        // Add some sample products with barcodes
        const products = [
          { id: '1', name: 'Coca Cola 500ml', barcode: '8901030893999', price: 40 },
          { id: '2', name: 'Maggi Noodles', barcode: '8901030849316', price: 14 },
          { id: '3', name: 'Parle-G Biscuits', barcode: '8901719100734', price: 20 },
          { id: '4', name: 'Britannia Good Day', barcode: '8901030856495', price: 30 },
          { id: '5', name: 'Amul Milk 1L', barcode: '8901030830574', price: 55 },
        ];

        const productStore = transaction.objectStore('products');
        products.forEach(product => productStore.add(product));

        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
          console.error('Transaction error initializing loose items:', event.target.error);
          reject(event.target.error);
        };
      };
      getAllRequest.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async saveBill(bill) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bills', 'customers'], 'readwrite');
      
      // Save bill
      const billStore = transaction.objectStore('bills');
      billStore.add(bill);

      // Save customer if new
      const customerStore = transaction.objectStore('customers');
      const customer = {
        name: bill.customerName,
        phone: bill.customerPhone
      };
      customerStore.put(customer);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getBills() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bills'], 'readonly');
      const store = transaction.objectStore('bills');
      const request = store.getAll();

      request.onsuccess = () => {
        const bills = request.result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        resolve(bills);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProductByBarcode(barcode) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.get(barcode);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getProducts() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLooseItems() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['looseItems'], 'readonly');
      const store = transaction.objectStore('looseItems');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCustomers() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['customers'], 'readonly');
      const store = transaction.objectStore('customers');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchBills(customerName) {
    const bills = await this.getBills();
    return bills.filter(bill => 
      bill.customerName.toLowerCase().includes(customerName.toLowerCase())
    );
  }
}

export const dbService = new IndexedDBService(); 