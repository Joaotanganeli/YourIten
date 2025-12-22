 -- Migration: Link products with games and add product types
-- This allows products (accounts, RP, etc.) to be displayed alongside boosting services

-- Add game and product_type columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS game VARCHAR(50),
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for game-based queries
CREATE INDEX IF NOT EXISTS idx_products_game ON products(game, product_type);

-- Update existing products to have a game (you can customize this)
UPDATE products SET game = 'general', product_type = 'peripherals' WHERE game IS NULL;

-- Add some sample game-specific products
INSERT INTO products (id, seller_id, seller_name, title, description, price, image_url, category, stock, game, product_type, is_featured) VALUES
-- League of Legends Products
('prod-lol-acc-1', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'LoL Smurf Account - Gold IV', 'Level 30 account with 40+ champions, ranked ready', 25.00, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'Accounts', 10, 'league_of_legends', 'account', true),
('prod-lol-rp-1', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'League of Legends RP - 1380 RP', 'Instant delivery of 1380 Riot Points', 10.00, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'Currency', 50, 'league_of_legends', 'currency', true),
('prod-lol-acc-2', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'LoL Account - Platinum II', 'Level 30, 60+ champions, good MMR', 45.00, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'Accounts', 5, 'league_of_legends', 'account', false),

-- Valorant Products
('prod-val-acc-1', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Valorant Account - Gold III', 'Full access account with multiple agents unlocked', 30.00, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400', 'Accounts', 8, 'valorant', 'account', true),
('prod-val-vp-1', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Valorant Points - 1000 VP', 'Instant delivery of Valorant Points', 10.00, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400', 'Currency', 30, 'valorant', 'currency', true),

-- Dota 2 Products
('prod-dota-acc-1', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Dota 2 Account - Ancient V', 'High MMR account with battle pass', 50.00, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', 'Accounts', 3, 'dota2', 'account', true),

-- Clash Royale Products
('prod-cr-acc-1', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Clash Royale Account - 6000 Trophies', 'Max level cards, legendary cards included', 35.00, 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400', 'Accounts', 6, 'clash_royale', 'account', true),
('prod-cr-gems-1', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Clash Royale Gems - 2500 Gems', 'Instant delivery of gems to your account', 15.00, 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400', 'Currency', 20, 'clash_royale', 'currency', true)
ON CONFLICT (id) DO NOTHING;

-- Create a view for easy querying of game offerings (both services and products)
CREATE OR REPLACE VIEW game_offerings AS
SELECT 
  'service' as offering_type,
  id,
  game,
  service_type as type_name,
  title,
  description,
  base_price as price,
  image_url,
  is_active as available,
  is_featured,
  is_hot_offer,
  weekly_order_count,
  created_at
FROM fixed_services
WHERE is_active = true

UNION ALL

SELECT 
  'product' as offering_type,
  id,
  game,
  product_type as type_name,
  title,
  description,
  price,
  image_url,
  (stock > 0) as available,
  is_featured,
  false as is_hot_offer,
  0 as weekly_order_count,
  created_at
FROM products
WHERE game IS NOT NULL AND stock > 0;

COMMENT ON VIEW game_offerings IS 'Unified view of all services and products available per game';
