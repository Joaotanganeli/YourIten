# YourIten - Marketplace

A modern marketplace web application built with Next.js, React, and TailwindCSS where buyers can browse and purchase products, and sellers can list and manage their products.

## Features

### Authentication
- User registration with email and password
- Login/logout functionality
- Role-based access (Buyer or Seller)

### For Sellers
- Create, edit, and delete product listings
- Set product title, description, price, category, stock, and image
- View and manage incoming orders
- Update order status (pending → confirmed → shipped → delivered)
- Dashboard with sales statistics

### For Buyers
- Browse all available products
- Search products by name or description
- Filter products by category
- Purchase products with quantity selection
- View order history and track order status
- Dashboard with order statistics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **Storage**: LocalStorage (for demo purposes)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── dashboard/      # User dashboard (role-based)
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── products/       # Products listing page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── SellerDashboard.tsx # Seller-specific dashboard
│   └── BuyerDashboard.tsx  # Buyer-specific dashboard
├── contexts/
│   └── AuthContext.tsx     # Authentication context
└── types/
    └── index.ts            # TypeScript type definitions
```

## Usage

1. **Register** as either a Buyer or Seller
2. **Sellers** can:
   - Add products from the dashboard
   - Manage product listings
   - Process incoming orders
3. **Buyers** can:
   - Browse products on the Products page
   - Purchase items
   - Track orders from the dashboard

## Notes

- This is a demo application using localStorage for data persistence
- For production, integrate with a proper backend and database
- Passwords are stored in plain text in localStorage (for demo only)
site to sell things on the internet
