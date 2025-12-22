-- YourIten Database Schema for PostgreSQL
-- Run this script to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'booster', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User game categories (for boosters)
CREATE TABLE user_game_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_category VARCHAR(50) NOT NULL CHECK (game_category IN ('league_of_legends', 'valorant', 'deadlock', 'dota2', 'clash_royale', 'arc_raiders')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_category)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_title VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_name VARCHAR(255) NOT NULL,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fixed services table
CREATE TABLE fixed_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game VARCHAR(50) NOT NULL CHECK (game IN ('league_of_legends', 'valorant', 'deadlock', 'dota2', 'clash_royale', 'arc_raiders')),
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('elo_boost', 'duo_boost', 'placement', 'account_level', 'mastery', 'coaching', 'account', 'currency')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    price_per_division DECIMAL(10, 2) DEFAULT 0 CHECK (price_per_division >= 0),
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service available options table
CREATE TABLE service_available_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES fixed_services(id) ON DELETE CASCADE,
    option_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Boost orders table
CREATE TABLE boost_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES fixed_services(id) ON DELETE RESTRICT,
    game VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    booster_id UUID REFERENCES users(id) ON DELETE SET NULL,
    booster_name VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'claimed', 'in_progress', 'completed', 'cancelled')),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    claimed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Boost configuration table (stores JSON-like data for boost details)
CREATE TABLE boost_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boost_order_id UUID NOT NULL REFERENCES boost_orders(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(boost_order_id, config_key)
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_game_categories_user_id ON user_game_categories(user_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_fixed_services_game ON fixed_services(game);
CREATE INDEX idx_fixed_services_service_type ON fixed_services(service_type);
CREATE INDEX idx_fixed_services_is_active ON fixed_services(is_active);
CREATE INDEX idx_boost_orders_buyer_id ON boost_orders(buyer_id);
CREATE INDEX idx_boost_orders_booster_id ON boost_orders(booster_id);
CREATE INDEX idx_boost_orders_status ON boost_orders(status);
CREATE INDEX idx_boost_orders_game ON boost_orders(game);
CREATE INDEX idx_service_available_options_service_id ON service_available_options(service_id);
CREATE INDEX idx_boost_configurations_boost_order_id ON boost_configurations(boost_order_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fixed_services_updated_at BEFORE UPDATE ON fixed_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boost_orders_updated_at BEFORE UPDATE ON boost_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
