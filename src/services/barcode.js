import { dbService } from './indexeddb';

export class BarcodeService {
  constructor() {
    this.buffer = '';
    this.timeout = null;
    this.onScanCallback = null;
  }

  initialize(onScan) {
    this.onScanCallback = onScan;
    
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  handleKeydown(event) {
    // Ignore if typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Clear timeout if exists
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Handle Enter key (end of barcode scan)
    if (event.key === 'Enter') {
      if (this.buffer.length > 0) {
        this.processBarcode(this.buffer);
        this.buffer = '';
      }
      return;
    }

    // Handle regular characters
    if (event.key.length === 1) {
      this.buffer += event.key;
      
      // Set timeout to clear buffer if no more input
      this.timeout = setTimeout(() => {
        this.buffer = '';
      }, 100);
    }
  }

  async processBarcode(barcode) {
    try {
      const product = await dbService.getProductByBarcode(barcode);
      if (this.onScanCallback) {
        this.onScanCallback(product);
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
      if (this.onScanCallback) {
        this.onScanCallback(null);
      }
    }
  }

  // Manual barcode entry for testing
  simulateScan(barcode) {
    this.processBarcode(barcode);
  }
} 