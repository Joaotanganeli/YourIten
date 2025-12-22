-- Migration: Add missing sample products for Deadlock and Arc Raiders
-- Schema already exists - only adding missing sample data

-- Add Deadlock products (missing from database)
INSERT INTO products (seller_id, seller_name, title, description, price, image_url, category, stock, game, product_type, is_featured, server, rank, level, is_handmade, is_ranked_ready) VALUES
( '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Deadlock Account - Ritualist', 'High rank account | All heroes unlocked | NA Server', 55.00, 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400', 'Accounts', 4, 'deadlock', 'account', true, 'NA', 'Ritualist', 35, false, true),
('550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Deadlock Account - Emissary', 'Top rank account | Full access | EU Server', 120.00, 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400', 'Accounts', 2, 'deadlock', 'account', true, 'EU', 'Emissary', 50, false, true)
ON CONFLICT (id) DO NOTHING;

-- Add Arc Raiders products (missing from database)
INSERT INTO products (seller_id, seller_name, title, description, price, image_url, category, stock, game, product_type, is_featured, server, rank, level, is_handmade, is_ranked_ready) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Arc Raiders Account - Starter', 'Level 20 account | Good gear | NA Server', 25.00, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', 'Accounts', 6, 'arc_raiders', 'account', true, 'NA', NULL, 20, false, true),
('550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Arc Raiders Account - Advanced', 'Level 45 account | Rare gear | EU Server', 65.00, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', 'Accounts', 3, 'arc_raiders', 'account', true, 'EU', NULL, 45, false, true)
ON CONFLICT (id) DO NOTHING;

-- Update test seller stats if not already set
UPDATE users 
SET total_sales = GREATEST(total_sales, 150), 
    total_revenue = GREATEST(total_revenue, 4500.00), 
    rating = COALESCE(NULLIF(rating, 0), 4.8), 
    total_reviews = GREATEST(total_reviews, 127)
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Ensure the rating trigger exists
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET rating = (
    SELECT COALESCE(AVG(rating), 5.00) FROM reviews WHERE seller_id = NEW.seller_id
  ),
  total_reviews = (
    SELECT COUNT(*) FROM reviews WHERE seller_id = NEW.seller_id
  )
  WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_review_insert ON reviews;
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_seller_rating();
