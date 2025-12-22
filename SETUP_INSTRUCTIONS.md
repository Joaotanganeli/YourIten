# PostgreSQL Migration Setup Instructions

## Overview

Your YourIten marketplace has been migrated from localStorage to PostgreSQL database. This provides:
- ✅ Persistent data storage
- ✅ Relational data integrity
- ✅ Better performance and scalability
- ✅ Multi-user support
- ✅ Data security

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `pg` - PostgreSQL client for Node.js
- `@types/pg` - TypeScript definitions
- All existing dependencies

### 2. Setup PostgreSQL Database

#### Option A: Local PostgreSQL Installation

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**
   ```bash
   # Start PostgreSQL service
   # Windows: Use Services app or pg_ctl
   # Mac/Linux: sudo service postgresql start
   
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE youriten_db;
   
   # Exit psql
   \q
   ```

3. **Run Schema Script**
   ```bash
   psql -U postgres -d youriten_db -f database/schema.sql
   ```

4. **(Optional) Load Sample Data**
   ```bash
   psql -U postgres -d youriten_db -f database/seed.sql
   ```

#### Option B: Cloud Database (Recommended for Production)

Use services like:
- **Supabase** (Free tier available): https://supabase.com
- **Neon** (Free tier available): https://neon.tech
- **Railway** (Free tier available): https://railway.app
- **Heroku Postgres**
- **AWS RDS**

### 3. Configure Environment Variables

1. **Copy the example file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file with your database credentials:**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/youriten_db
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=development
   ```

   **Important:** 
   - Replace `username` and `password` with your PostgreSQL credentials
   - Generate a secure JWT_SECRET (use a random string generator)
   - For cloud databases, use the connection string provided by your service

### 4. Test Database Connection

Run the development server:
```bash
npm run dev
```

If successful, you should see:
- Server running on http://localhost:3000
- No database connection errors in console

## Database Schema

### Tables Created

1. **users** - User accounts with authentication
2. **user_game_categories** - Booster game specializations
3. **products** - Marketplace products
4. **orders** - Product purchase orders
5. **fixed_services** - Boosting services
6. **service_available_options** - Service configuration options
7. **boost_orders** - Boost service orders
8. **boost_configurations** - Boost order details

### Sample Test Accounts (if you ran seed.sql)

- **Admin:** admin@youriten.com / admin123
- **Buyer:** buyer@test.com / admin123
- **Seller:** seller@test.com / admin123
- **Booster:** booster@test.com / admin123

## API Endpoints Created

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product (seller/admin only)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (seller/admin only)
- `DELETE /api/products/[id]` - Delete product (seller/admin only)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/[id]` - Update order status

### Services
- `GET /api/services` - List boost services
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/[id]` - Update service (admin only)
- `DELETE /api/services/[id]` - Delete service (admin only)
- `PATCH /api/services/[id]` - Toggle service active status (admin only)

### Boost Orders
- `GET /api/boost-orders` - List boost orders
- `POST /api/boost-orders` - Create boost order
- `PATCH /api/boost-orders/[id]` - Update boost order / Claim order

## Next Steps

After setup, you need to update the frontend components to use the API instead of localStorage. The API routes are ready, but the React components still need to be updated to:

1. Store JWT token in localStorage after login
2. Send Authorization header with API requests
3. Fetch data from API endpoints instead of localStorage
4. Handle loading states and errors

## Troubleshooting

### Database Connection Failed
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `psql -U postgres -l`
- Check firewall settings

### Permission Denied
- Grant proper permissions to database user
- For local dev, you can use the postgres superuser

### Port Already in Use
- Change Next.js port: `npm run dev -- -p 3001`
- Or stop the process using port 3000

### Schema Errors
- Drop and recreate database if needed (WARNING: loses data)
- Ensure you're running schema.sql on the correct database

## Security Notes

⚠️ **Important for Production:**
- Change JWT_SECRET to a strong random string
- Use environment variables for all secrets
- Enable SSL for database connections
- Implement rate limiting on API routes
- Add input validation and sanitization
- Use HTTPS for all connections

## Database Backup

Regular backups are recommended:

```bash
# Backup
pg_dump -U postgres youriten_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres youriten_db < backup_20231220.sql
```

## Support

For detailed database schema information, see: `database/README.md`
