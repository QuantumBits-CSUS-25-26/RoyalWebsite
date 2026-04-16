-- This script runs automatically when the MySQL container is created for the first time.
-- The database "RoyalWebsite" is already created by the MYSQL_DATABASE env var.

-- Create a non-root application user (optional — you can keep using root for local dev)
-- CREATE USER IF NOT EXISTS 'royalweb_user'@'%' IDENTIFIED BY 'royalweb_pass';
-- GRANT ALL PRIVILEGES ON RoyalWebsite.* TO 'royalweb_user'@'%';
-- FLUSH PRIVILEGES;

-- Ensure UTF-8
ALTER DATABASE RoyalWebsite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
