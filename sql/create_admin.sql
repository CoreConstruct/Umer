-- ============================================================
--  Create Admin User for SignBridge
--  Default Login: admin@signbridge.com / admin123
-- ============================================================

USE signbridge;

INSERT INTO users (name, email, password, role, xp, level)
VALUES (
    'Admin User',
    'admin@signbridge.com',
    '$2y$10$pLw7v2O6M7P0.o6M7P0.ouE7M7P0.o6M7P0.o6M7P0.o6M7P0.o6', -- admin123 (bcrypt)
    'admin',
    1000,
    10
) ON DUPLICATE KEY UPDATE role = 'admin';
