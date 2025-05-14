CREATE DATABASE IF NOT EXISTS rest;
USE rest;

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    order_items JSON,
    total_price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Очікує',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

