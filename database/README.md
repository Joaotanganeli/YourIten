# Database Setup Guide

## Prerequisites

- PostgreSQL 12 or higher installed
- Database user with CREATE DATABASE privileges

## Setup Steps

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE youriten_db;

# Connect to the new database
\c youriten_db
```

### 2. Run Schema Script

```bash
# From the database directory
psql -U postgres -d youriten_db -f schema.sql
```

This will create:
- All tables with proper relationships
- Indexes for performance optimization
- Triggers for automatic timestamp updates
- UUID extension for generating unique IDs

### 3. (Optional) Run Seed Data

```bash
# From the database directory
psql -U postgres -d youriten_db -f seed.sql
```

This creates sample data including:
- Test users (admin, buyer, seller, booster)
- Sample products
- Sample services
- Default password for all test users: `admin123`

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/youriten_db
JWT_SECRET=generate-a-secure-random-string-here
NODE_ENV=development
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

```bash
npm run dev
```

## Database Schema Overview

### Tables

1. **users** - User accounts with roles (buyer, seller, booster, admin)
2. **user_game_categories** - Game categories for boosters
3. **products** - Physical products listed by sellers
4. **orders** - Product purchase orders
5. **fixed_services** - Boosting services configuration
6. **service_available_options** - Options available for each service
7. **boost_orders** - Boosting service orders
8. **boost_configurations** - Configuration details for each boost order

### Relationships

- Users → Products (one-to-many)
- Users → Orders (buyer and seller relationships)
- Users → Boost Orders (buyer and booster relationships)
- Fixed Services → Boost Orders (one-to-many)
- Fixed Services → Service Available Options (one-to-many)
- Boost Orders → Boost Configurations (one-to-many)

## Security Notes

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Database queries use parameterized statements to prevent SQL injection
- Role-based access control is implemented in API routes

## Backup and Restore

### Backup
```bash
pg_dump -U postgres youriten_db > backup.sql
```

### Restore
```bash
psql -U postgres youriten_db < backup.sql
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env file
- Ensure database user has proper permissions

### Migration Issues
- Drop and recreate database if needed (WARNING: loses all data)
```sql
DROP DATABASE youriten_db;
CREATE DATABASE youriten_db;
```
