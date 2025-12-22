-- Migration: Add featured flags, view counts, and game metadata
-- Run this after the initial schema setup

-- Add featured and stats columns to fixed_services
ALTER TABLE fixed_services
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hot_offer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_order_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create game_categories table for landing page
CREATE TABLE IF NOT EXISTS game_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  banner_url TEXT,
  icon_name VARCHAR(50),
  total_offers INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert game categories
INSERT INTO game_categories (id, name, description, image_url, banner_url, icon_name, total_offers, display_order) VALUES
('league_of_legends', 'League of Legends', 'Professional boosting and coaching services', 
 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800', 
 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
 'Swords', 150, 1),
('valorant', 'Valorant', 'Rank boosting and account services',
 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200',
 'Crosshair', 120, 2),
('dota2', 'Dota 2', 'MMR boosting and coaching',
 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
 'Gamepad2', 80, 3),
('deadlock', 'Deadlock', 'Rank boost and account leveling',
 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=800',
 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=1200',
 'Target', 60, 4),
('clash_royale', 'Clash Royale', 'Trophy pushing and account services',
 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800',
 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1200',
 'Trophy', 45, 5),
('arc_raiders', 'Arc Raiders', 'Rank boosting and gear farming',
 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
 'Zap', 30, 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  banner_url = EXCLUDED.banner_url,
  total_offers = EXCLUDED.total_offers;

-- Update some services to be featured/hot offers
UPDATE fixed_services 
SET is_featured = true, is_hot_offer = true, weekly_order_count = 50
WHERE service_type IN ('elo_boost', 'duo_boost')
LIMIT 3;

-- Create function to update weekly stats (reset every week)
CREATE OR REPLACE FUNCTION reset_weekly_stats()
RETURNS void AS $$
BEGIN
  UPDATE fixed_services SET weekly_order_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_services_featured ON fixed_services(is_featured, is_hot_offer);
CREATE INDEX IF NOT EXISTS idx_services_game ON fixed_services(game, is_active);
CREATE INDEX IF NOT EXISTS idx_services_weekly ON fixed_services(weekly_order_count DESC);

COMMENT ON TABLE game_categories IS 'Stores game category information for the landing page';
COMMENT ON COLUMN fixed_services.is_featured IS 'Whether this service appears in featured sections';
COMMENT ON COLUMN fixed_services.is_hot_offer IS 'Whether this service appears in hot offers section';
COMMENT ON COLUMN fixed_services.weekly_order_count IS 'Number of orders this week (reset weekly)';
