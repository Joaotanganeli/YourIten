-- Seed data for YourIten Database
-- This creates sample data for testing

-- Insert sample admin user (password: admin123)
-- Password hash generated with bcrypt, salt rounds = 10
INSERT INTO users (id, email, password_hash, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@youriten.com', '$2a$10$RfjTzWO3WPugl.K6FIUuQutrDlWlu681yssp8JpjyfOSmSNgleuDS', 'Admin User', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'buyer@test.com', '$2a$10$RfjTzWO3WPugl.K6FIUuQutrDlWlu681yssp8JpjyfOSmSNgleuDS', 'Test Buyer', 'buyer'),
('550e8400-e29b-41d4-a716-446655440002', 'seller@test.com', '$2a$10$RfjTzWO3WPugl.K6FIUuQutrDlWlu681yssp8JpjyfOSmSNgleuDS', 'Test Seller', 'seller'),
('550e8400-e29b-41d4-a716-446655440003', 'booster@test.com', '$2a$10$RfjTzWO3WPugl.K6FIUuQutrDlWlu681yssp8JpjyfOSmSNgleuDS', 'Test Booster', 'booster');

-- Insert game categories for booster
INSERT INTO user_game_categories (user_id, game_category) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'league_of_legends'),
('550e8400-e29b-41d4-a716-446655440003', 'valorant');

-- Insert sample products
INSERT INTO products (id, seller_id, seller_name, title, description, price, image_url, category, stock) VALUES
('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Gaming Mouse', 'High-performance gaming mouse with RGB lighting', 49.99, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', 'Peripherals', 50),
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Test Seller', 'Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 129.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 'Peripherals', 30);

-- Insert sample fixed services
INSERT INTO fixed_services (id, game, service_type, title, description, base_price, price_per_division, image_url, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440000', 'league_of_legends', 'elo_boost', 'League of Legends Elo Boost', 'Professional elo boosting service for League of Legends', 10.00, 5.00, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', true),
('750e8400-e29b-41d4-a716-446655440001', 'valorant', 'duo_boost', 'Valorant Duo Boost', 'Play with a professional booster in Valorant', 15.00, 8.00, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', true);

-- Insert service options
INSERT INTO service_available_options (service_id, option_value) VALUES
('750e8400-e29b-41d4-a716-446655440000', 'Solo Queue'),
('750e8400-e29b-41d4-a716-446655440000', 'Duo Queue'),
('750e8400-e29b-41d4-a716-446655440000', 'Priority Queue'),
('750e8400-e29b-41d4-a716-446655440001', 'Voice Chat'),
('750e8400-e29b-41d4-a716-446655440001', 'Coaching Included');

-- Note: Orders and boost orders will be created dynamically by users
