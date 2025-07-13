# QuickBill Pro

A modern offline-first billing and inventory management app for shops, built with React (Vite), Tailwind CSS, and IndexedDB. Supports barcode products, loose items, bill history, and PWA offline mode.

---

## Features
- Create bills with barcode products and loose items
- View and search bill history
- Manage inventory: add/edit products and loose items
- Works offline (PWA, IndexedDB)
- Print professional receipts
- Responsive, mobile-friendly UI

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

---

## Deployment (Vercel)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com/), sign up with GitHub, and import your repo**

3. **Vercel will auto-detect Vite. Just click Deploy!**
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Your app will be live at `https://your-project-name.vercel.app`**

---

## Tech Stack
- React (Vite)
- Tailwind CSS
- IndexedDB (local database)
- PWA (offline support)

---

## License
MIT
