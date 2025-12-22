# User Spending Tracking - Implementation Guide

## ✅ Latest Fixes Applied

### 1. AdminDashboard Line 311 Error - FIXED
**Error:** `TypeError: Cannot read properties of undefined (reading 'replace')`

**Root Cause:** API was returning `service_type` (snake_case) but code expected `serviceType` (camelCase)

**Solution:** Updated `src/lib/api-client.ts` to automatically convert all snake_case fields to camelCase:
```typescript
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}
```

Now all API responses are automatically converted:
- `service_type` → `serviceType`
- `base_price` → `basePrice`
- `price_per_division` → `pricePerDivision`
- `total_price` → `totalPrice`
- etc.

---

### 2. BuyerDashboard Line 199 Error - FIXED
**Error:** `TypeError: Cannot read properties of undefined (reading 'toFixed')`

**Root Cause:** `order.totalPrice` was undefined because API returned `total_price` (snake_case)

**Solution:** Same camelCase conversion now handles this automatically. All numeric fields are also converted from strings to numbers.

---

## 💰 How User Spending is Tracked

### Current Implementation (Client-Side Calculation)

**Location:** `src/components/BuyerDashboard.tsx` (Lines 72-73)

```typescript
const totalSpent = 
  orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0) +
  boostOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0)
```

### How It Works:

1. **Fetches all orders** for the buyer from the database
   - Product orders from `/api/orders?role=buyer`
   - Boost orders from `/api/boost-orders?role=buyer`

2. **Filters out cancelled orders** (only counts completed/pending/in-progress)

3. **Sums up `totalPrice`** from both order types

4. **Displays in real-time** on the dashboard

### Data Storage:

#### Product Orders Table (`orders`)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  buyer_id UUID NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,  -- Stored here
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Boost Orders Table (`boost_orders`)
```sql
CREATE TABLE boost_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES fixed_services(id),
  buyer_id UUID NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,  -- Stored here
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 Spending Breakdown by User

### Query to Get Total Spending Per User

```sql
-- Total spending across all orders (products + boosts)
SELECT 
  u.id,
  u.name,
  u.email,
  COALESCE(SUM(o.total_price), 0) + COALESCE(SUM(bo.total_price), 0) as total_spent,
  COUNT(DISTINCT o.id) as product_orders_count,
  COUNT(DISTINCT bo.id) as boost_orders_count
FROM users u
LEFT JOIN orders o ON u.id = o.buyer_id AND o.status != 'cancelled'
LEFT JOIN boost_orders bo ON u.id = bo.buyer_id AND bo.status != 'cancelled'
WHERE u.role = 'buyer'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;
```

### Query to Get Spending by Time Period

```sql
-- Spending in the last 30 days
SELECT 
  u.name,
  SUM(o.total_price) as product_spending,
  SUM(bo.total_price) as boost_spending,
  SUM(o.total_price) + SUM(bo.total_price) as total_spending
FROM users u
LEFT JOIN orders o ON u.id = o.buyer_id 
  AND o.status != 'cancelled'
  AND o.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN boost_orders bo ON u.id = bo.buyer_id 
  AND bo.status != 'cancelled'
  AND bo.created_at >= NOW() - INTERVAL '30 days'
WHERE u.role = 'buyer'
GROUP BY u.id, u.name;
```

---

## 🎯 Where Spending is Displayed

### 1. **Buyer Dashboard** (`src/components/BuyerDashboard.tsx`)
- **Line 72-73:** Calculates total spent
- **Line 113-127:** Displays in stats card
```tsx
<div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
  <div className="flex items-center space-x-4">
    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
      <ShoppingBag className="h-6 w-6 text-green-400" />
    </div>
    <div>
      <p className="text-sm text-dark-400">Total Spent</p>
      <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
    </div>
  </div>
</div>
```

### 2. **Individual Order Cards**
Each order shows its own `totalPrice`:
- Product orders: Line 199
- Boost orders: Line 237

---

## 🔄 How Spending Updates

### When a New Order is Created:

1. **User purchases product** → `POST /api/orders`
   - Calculates: `totalPrice = productPrice × quantity`
   - Stores in database: `INSERT INTO orders (total_price, ...) VALUES ($totalPrice, ...)`

2. **User purchases boost** → `POST /api/boost-orders`
   - Frontend calculates price based on rank difference, options, etc.
   - Stores in database: `INSERT INTO boost_orders (total_price, ...) VALUES ($totalPrice, ...)`

3. **Dashboard refreshes** → Fetches updated orders
   - Recalculates `totalSpent` from all non-cancelled orders
   - Displays new total

---

## 💡 Future Enhancements (Optional)

### Option 1: Add a `user_stats` Table
```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_spent DECIMAL(10, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  last_order_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update with triggers when orders are created
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, total_spent, total_orders, last_order_date)
  VALUES (NEW.buyer_id, NEW.total_price, 1, NEW.created_at)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_spent = user_stats.total_spent + NEW.total_price,
    total_orders = user_stats.total_orders + 1,
    last_order_date = NEW.created_at,
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Option 2: Add Spending Analytics API Endpoint
```typescript
// GET /api/users/[id]/stats
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await query(`
    SELECT 
      COALESCE(SUM(o.total_price), 0) as product_spending,
      COALESCE(SUM(bo.total_price), 0) as boost_spending,
      COUNT(DISTINCT o.id) as product_orders,
      COUNT(DISTINCT bo.id) as boost_orders
    FROM users u
    LEFT JOIN orders o ON u.id = o.buyer_id AND o.status != 'cancelled'
    LEFT JOIN boost_orders bo ON u.id = bo.buyer_id AND bo.status != 'cancelled'
    WHERE u.id = $1
    GROUP BY u.id
  `, [params.id])
  
  return NextResponse.json(result.rows[0])
}
```

---

## 📝 Summary

### Current State:
✅ **Spending is tracked** in the database via `total_price` in both `orders` and `boost_orders` tables  
✅ **Calculated on-demand** when buyer views their dashboard  
✅ **Filtered by status** (excludes cancelled orders)  
✅ **Includes both** product purchases and boost services  
✅ **Automatically converted** from PostgreSQL strings to JavaScript numbers  
✅ **Displayed in real-time** with proper formatting  

### Data Flow:
```
User makes purchase 
  → API calculates totalPrice 
  → Stores in database (orders or boost_orders table)
  → Dashboard fetches all orders
  → Frontend sums totalPrice from all non-cancelled orders
  → Displays total spent
```

No additional tables or tracking mechanisms are needed - everything is calculated from the existing order data!
