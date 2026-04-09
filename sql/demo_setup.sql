-- sql/demo_setup.sql
-- Run this to create exactly 4 demo users with varying levels of progress, and 1 admin.
-- Default password for all users: 'password123'
-- Admin password: 'admin123'

USE signbridge;

-- Clear any existing users and progress for a clean demo state
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE lesson_progress;
TRUNCATE TABLE history;
TRUNCATE TABLE user_achievements;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Beginner User (Level 1, No progress)
INSERT INTO users (id, name, email, password, role, xp, level, streak, created_at)
VALUES (1, 'Beginner Ben', 'beginner@demo.com', 'password123', 'user', 0, 1, 0, NOW());

-- 2. Alphabet Master (Level 3, All alphabets mastered)
INSERT INTO users (id, name, email, password, role, xp, level, streak, created_at)
VALUES (2, 'Alphabet Alice', 'alice@demo.com', 'password123', 'user', 450, 3, 5, NOW());

INSERT INTO lesson_progress (user_id, lesson_id, completed, score) VALUES (2, 0, 1, 100);
INSERT INTO lesson_progress (user_id, lesson_id, completed, score) VALUES (2, 1, 1, 100);

-- Insert history for Alphabet A-Z for Alice
INSERT INTO history (user_id, letter, is_correct, category) VALUES 
(2,'A',1,'alphabet'),(2,'B',1,'alphabet'),(2,'C',1,'alphabet'),(2,'D',1,'alphabet'),
(2,'E',1,'alphabet'),(2,'F',1,'alphabet'),(2,'G',1,'alphabet'),(2,'H',1,'alphabet'),
(2,'I',1,'alphabet'),(2,'J',1,'alphabet'),(2,'K',1,'alphabet'),(2,'L',1,'alphabet'),
(2,'M',1,'alphabet'),(2,'N',1,'alphabet'),(2,'O',1,'alphabet'),(2,'P',1,'alphabet'),
(2,'Q',1,'alphabet'),(2,'R',1,'alphabet'),(2,'S',1,'alphabet'),(2,'T',1,'alphabet'),
(2,'U',1,'alphabet'),(2,'V',1,'alphabet'),(2,'W',1,'alphabet'),(2,'X',1,'alphabet'),
(2,'Y',1,'alphabet'),(2,'Z',1,'alphabet');

-- 3. Mid Learner (Level 5, Alphabets + Numbers)
INSERT INTO users (id, name, email, password, role, xp, level, streak, created_at)
VALUES (3, 'Charlie Numbers', 'charlie@demo.com', 'password123', 'user', 850, 5, 12, NOW());

INSERT INTO lesson_progress (user_id, lesson_id, completed, score) VALUES (3, 0, 1, 100), (3, 1, 1, 100), (3, 2, 1, 100);

-- Insert history for Alphabet A-Z and Numbers 1-10 for Charlie
INSERT INTO history (user_id, letter, is_correct, category) VALUES 
(3,'A',1,'alphabet'),(3,'B',1,'alphabet'),(3,'C',1,'alphabet'),(3,'D',1,'alphabet'),
(3,'E',1,'alphabet'),(3,'F',1,'alphabet'),(3,'G',1,'alphabet'),(3,'H',1,'alphabet'),
(3,'I',1,'alphabet'),(3,'J',1,'alphabet'),(3,'K',1,'alphabet'),(3,'L',1,'alphabet'),
(3,'M',1,'alphabet'),(3,'N',1,'alphabet'),(3,'O',1,'alphabet'),(3,'P',1,'alphabet'),
(3,'Q',1,'alphabet'),(3,'R',1,'alphabet'),(3,'S',1,'alphabet'),(3,'T',1,'alphabet'),
(3,'U',1,'alphabet'),(3,'V',1,'alphabet'),(3,'W',1,'alphabet'),(3,'X',1,'alphabet'),
(3,'Y',1,'alphabet'),(3,'Z',1,'alphabet'),
(3,'1',1,'numbers'),(3,'2',1,'numbers'),(3,'3',1,'numbers'),(3,'4',1,'numbers'),
(3,'5',1,'numbers'),(3,'6',1,'numbers'),(3,'7',1,'numbers'),(3,'8',1,'numbers'),
(3,'9',1,'numbers'),(3,'10',1,'numbers');

-- 4. Expert User (Level 12, 100% platform completion)
INSERT INTO users (id, name, email, password, role, xp, level, streak, created_at)
VALUES (4, 'Expert Emma', 'emma@demo.com', 'password123', 'user', 2500, 12, 45, NOW());

INSERT INTO lesson_progress (user_id, lesson_id, completed, score) VALUES (4, 0, 1, 100), (4, 1, 1, 100), (4, 2, 1, 100), (4, 3, 1, 100);

-- Master everything for Emma
INSERT INTO history (user_id, letter, is_correct, category) VALUES 
(4,'A',1,'alphabet'),(4,'B',1,'alphabet'),(4,'C',1,'alphabet'),(4,'D',1,'alphabet'),
(4,'E',1,'alphabet'),(4,'F',1,'alphabet'),(4,'G',1,'alphabet'),(4,'H',1,'alphabet'),
(4,'I',1,'alphabet'),(4,'J',1,'alphabet'),(4,'K',1,'alphabet'),(4,'L',1,'alphabet'),
(4,'M',1,'alphabet'),(4,'N',1,'alphabet'),(4,'O',1,'alphabet'),(4,'P',1,'alphabet'),
(4,'Q',1,'alphabet'),(4,'R',1,'alphabet'),(4,'S',1,'alphabet'),(4,'T',1,'alphabet'),
(4,'U',1,'alphabet'),(4,'V',1,'alphabet'),(4,'W',1,'alphabet'),(4,'X',1,'alphabet'),
(4,'Y',1,'alphabet'),(4,'Z',1,'alphabet'),
(4,'1',1,'numbers'),(4,'2',1,'numbers'),(4,'3',1,'numbers'),(4,'4',1,'numbers'),
(4,'5',1,'numbers'),(4,'6',1,'numbers'),(4,'7',1,'numbers'),(4,'8',1,'numbers'),
(4,'9',1,'numbers'),(4,'10',1,'numbers'),
(4,'please',1,'phrases'),(4,'sorry',1,'phrases'),(4,'yes',1,'phrases'),(4,'no',1,'phrases'),
(4,'help',1,'phrases'),(4,'understand',1,'phrases'),(4,'water2',1,'phrases'),(4,'toilet',1,'phrases'),
(4,'thanks',1,'phrases'),(4,'hello',1,'phrases'),(4,'goodbye',1,'phrases'),(4,'food',1,'phrases'),
(4,'love',1,'phrases'),(4,'family',1,'phrases');

-- Add achievements for Emma
INSERT INTO user_achievements (user_id, achievement_id) VALUES (4, 1), (4, 2), (4, 3), (4, 4), (4, 7), (4, 10);

-- 5. Admin User
INSERT INTO users (id, name, email, password, role, xp, level, streak, created_at)
VALUES (5, 'Admin', 'admin@signbridge.com', 'admin123', 'admin', 0, 1, 0, NOW());
