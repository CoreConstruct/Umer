-- ============================================================
--  SignBridge Database Schema
--  Run this once in phpMyAdmin or MySQL CLI:
--  mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS signbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE signbridge;

-- ─────────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(191)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,          -- bcrypt hash
    xp          INT UNSIGNED  NOT NULL DEFAULT 0,
    level       INT UNSIGNED  NOT NULL DEFAULT 1,
    streak      INT UNSIGNED  NOT NULL DEFAULT 0,
    role        ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    last_active DATE          NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  LESSON PROGRESS (tracks completion + scores)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    lesson_id   INT UNSIGNED NOT NULL,
    score       INT UNSIGNED NOT NULL DEFAULT 0,  -- Out of 100
    completed   TINYINT(1)   NOT NULL DEFAULT 0,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_lesson (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  QUIZ ATTEMPTS (individual question logs)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    lesson_id   INT UNSIGNED NOT NULL,
    question    VARCHAR(255) NOT NULL,
    correct_ans VARCHAR(100) NOT NULL,
    user_ans    VARCHAR(100) NOT NULL,
    is_correct  TINYINT(1)   NOT NULL,
    xp_earned   INT UNSIGNED NOT NULL DEFAULT 0,
    timestamp   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  HISTORY  (one row per detection attempt)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS history (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    letter      CHAR(1)      NOT NULL,
    confidence  FLOAT        NOT NULL DEFAULT 0,
    is_correct  TINYINT(1)   NOT NULL DEFAULT 0,
    timestamp   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_ts (user_id, timestamp)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  PRACTICE SESSIONS  (one row per day/session)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_sessions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    correct     INT UNSIGNED NOT NULL DEFAULT 0,
    wrong       INT UNSIGNED NOT NULL DEFAULT 0,
    streak      INT UNSIGNED NOT NULL DEFAULT 0,
    date        DATE         NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_date (user_id, date)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  ACHIEVEMENTS  (static catalogue)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon        VARCHAR(10)  NOT NULL DEFAULT '🏆',
    xp_reward   INT UNSIGNED NOT NULL DEFAULT 50
) ENGINE=InnoDB;

INSERT INTO achievements (name, description, icon, xp_reward) VALUES
('First Sign',        'Complete your first sign detection',            '🌟', 20),
('10 Correct',        'Get 10 correct detections',                     '✅', 50),
('50 Correct',        'Get 50 correct detections',                     '🎯', 100),
('7-Day Streak',      'Practice 7 days in a row',                      '🔥', 150),
('Speed Signer',      'Get 10 correct signs in a single session',      '⚡', 75),
('Perfectionist',     'Achieve 90%+ accuracy in a session (min 10)',   '💎', 100),
('Alphabet Master',   'Successfully sign all 26 letters at least once','🅰️', 200),
('Conversationalist', 'Accumulate 500 XP',                             '💬', 50),
('Dedicated Learner', 'Complete 30 practice sessions',                 '🎓', 200);

-- ─────────────────────────────────────────────
--  USER ACHIEVEMENTS  (junction)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        INT UNSIGNED NOT NULL,
    achievement_id INT UNSIGNED NOT NULL,
    earned_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_ach (user_id, achievement_id),
    FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB;
