-- ============================================
-- Todo App Database Schema
-- Run this file in MySQL to create the database,
-- tables, and a default admin account.
-- ============================================

CREATE DATABASE IF NOT EXISTS todo_app;
USE todo_app;

-- Users table (holds both admins and normal users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Todos table (each todo belongs to one user)
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Default admin account
-- Email: admin@todo.com
-- Password: Admin123!
-- (password below is a bcrypt hash of "Admin123!")
-- You can log in with this account right away,
-- or register your own admin using the /register-admin
-- instructions in the README.
-- ============================================
INSERT INTO users (name, email, password, role)
VALUES (
    'Administrator',
    'admin@todo.com',
    '$2a$10$oAC3OvrH9HyAZw7js/bTZeoXnP2micGPQZRVEBAEj/sT20iCGLMDW',
    'admin'
)
ON DUPLICATE KEY UPDATE email = email;
