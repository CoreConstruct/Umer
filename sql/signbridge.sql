-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2026 at 06:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `signbridge`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `icon` varchar(10) NOT NULL DEFAULT '?',
  `xp_reward` int(10) UNSIGNED NOT NULL DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `name`, `description`, `icon`, `xp_reward`) VALUES
(1, 'First Sign', 'Complete your first detection', '🌟', 20),
(2, '10 Correct', 'Get 10 correct detections', '✅', 50),
(3, '50 Correct', 'Get 50 correct detections', '🎯', 100),
(4, '7-Day Streak', 'Practice 7 consecutive days', '🔥', 150),
(5, 'Speed Signer', '10 correct signs in a single session', '⚡', 75),
(6, 'Perfectionist', '90%+ accuracy in a session (min 10 attempts)', '💎', 100),
(7, 'Alphabet Master', 'Sign all 26 letters correctly at least once', '🅰️', 200),
(8, 'Conversationalist', 'Accumulate 500 XP', '💬', 50),
(9, 'Dedicated Learner', 'Complete 30 practice sessions', '🎓', 200),
(10, 'Quiz Ace', 'Score 100% on any quiz', '🧠', 75),
(11, 'Lesson Complete', 'Finish your first full lesson', '📚', 50);

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `letter` varchar(30) NOT NULL,
  `confidence` float NOT NULL DEFAULT 0,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `category` varchar(30) NOT NULL DEFAULT 'alphabet',
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `history`
--

INSERT INTO `history` (`id`, `user_id`, `letter`, `confidence`, `is_correct`, `category`, `timestamp`) VALUES
(1, 1, 'F', 0.7099, 0, 'alphabet', '2026-04-05 18:32:43'),
(2, 1, 'F', 0.6903, 0, 'alphabet', '2026-04-05 18:32:52'),
(3, 1, 'W', 0.5806, 0, 'alphabet', '2026-04-05 18:42:28'),
(4, 1, 'A', 0.88, 0, 'alphabet', '2026-04-08 21:53:56'),
(5, 1, 'A', 0.88, 0, 'alphabet', '2026-04-08 21:53:58'),
(6, 1, 'A', 0.88, 0, 'alphabet', '2026-04-08 21:53:58'),
(7, 1, 'A', 0.88, 0, 'alphabet', '2026-04-08 21:53:58'),
(8, 1, 'A', 0.88, 0, 'alphabet', '2026-04-08 21:53:59'),
(9, 1, 'Y', 0.88, 0, 'alphabet', '2026-04-08 21:54:10'),
(10, 1, 'F', 0.84, 0, 'alphabet', '2026-04-08 21:54:10'),
(11, 1, 'A', 0.45, 0, 'alphabet', '2026-04-08 21:54:11'),
(12, 1, 'F', 0.84, 0, 'alphabet', '2026-04-08 21:54:11'),
(13, 1, 'A', 0.45, 0, 'alphabet', '2026-04-08 21:54:11'),
(14, 1, 'B', 0.88, 0, 'alphabet', '2026-04-08 21:54:12'),
(15, 1, 'S', 0.78, 0, 'alphabet', '2026-04-08 21:54:12'),
(16, 1, 'S', 0.78, 0, 'alphabet', '2026-04-08 21:54:12'),
(17, 1, 'S', 0.78, 0, 'alphabet', '2026-04-08 21:54:12'),
(18, 1, 'S', 0.78, 0, 'alphabet', '2026-04-08 21:54:13'),
(19, 1, 'S', 0.78, 0, 'alphabet', '2026-04-08 21:54:14'),
(20, 1, 'S', 0.78, 0, 'alphabet', '2026-04-08 21:54:14'),
(21, 1, 'S', 0.78, 0, 'alphabet', '2026-04-08 21:54:15'),
(22, 2, 'A', 0.88, 1, 'alphabet', '2026-04-08 22:04:59'),
(23, 2, 'A', 0.88, 1, 'alphabet', '2026-04-08 22:05:02'),
(24, 2, 'A', 0.88, 1, 'alphabet', '2026-04-08 22:05:03'),
(25, 2, 'A', 0.88, 1, 'alphabet', '2026-04-08 22:05:05'),
(26, 2, 'B', 0.88, 1, 'alphabet', '2026-04-08 22:05:31');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `lesson_id` int(10) UNSIGNED NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `score` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_progress`
--

INSERT INTO `lesson_progress` (`id`, `user_id`, `lesson_id`, `completed`, `score`, `updated_at`) VALUES
(1, 1, 0, 0, 60, '2026-04-09 09:27:11'),
(14, 2, 0, 0, 100, '2026-04-08 22:16:29');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(191) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `email`, `token`, `expires_at`, `used`, `created_at`) VALUES
(1, 'uk981968@gmail.com', '156a76fd8087dd3616f75521695226f06b0bc204dd115343fe5620809aae4b46', '2026-04-05 16:06:11', 1, '2026-04-05 18:36:11'),
(2, 'uk981968@gmail.com', 'ce80016be91d78ecf57b36c404f02679fe777df681a2dbd2268a9b95f0daf8b7', '2026-04-08 19:23:07', 1, '2026-04-08 21:53:07'),
(3, 'uk981968@gmail.com', 'b2d2e23ca2381d8ed828d9c0d1a3ec0b4782f2fb3af1f8500e237c697861efc4', '2026-04-08 19:59:49', 0, '2026-04-08 22:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `practice_sessions`
--

CREATE TABLE `practice_sessions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `correct` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `wrong` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `streak` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `practice_sessions`
--

INSERT INTO `practice_sessions` (`id`, `user_id`, `correct`, `wrong`, `streak`, `date`) VALUES
(1, 1, 0, 3, 0, '2026-04-05'),
(4, 1, 0, 18, 0, '2026-04-08'),
(22, 2, 5, 0, 5, '2026-04-08');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `lesson_id` int(10) UNSIGNED NOT NULL,
  `question` varchar(255) NOT NULL,
  `correct_ans` varchar(100) NOT NULL,
  `user_ans` varchar(100) NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `xp_earned` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `taken_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `user_id`, `lesson_id`, `question`, `correct_ans`, `user_ans`, `is_correct`, `xp_earned`, `taken_at`) VALUES
(1, 1, 0, 'Which letter is this sign?', 'B', 'B', 1, 5, '2026-04-05 18:33:15'),
(2, 1, 0, 'Which letter is this sign?', 'K', 'E', 0, 0, '2026-04-05 18:33:15'),
(3, 1, 0, 'Which letter is this sign?', 'C', 'E', 0, 0, '2026-04-05 18:33:15'),
(4, 1, 0, 'Which letter is this sign?', 'J', 'M', 0, 0, '2026-04-05 18:33:15'),
(5, 1, 0, 'Which letter is this sign?', 'H', 'H', 1, 5, '2026-04-05 18:33:15'),
(6, 1, 0, 'Which letter is this sign?', 'B', 'D', 0, 0, '2026-04-05 18:34:09'),
(7, 1, 0, 'Which letter is this sign?', 'C', 'M', 0, 0, '2026-04-05 18:34:09'),
(8, 1, 0, 'Which letter is this sign?', 'G', 'B', 0, 0, '2026-04-05 18:34:09'),
(9, 1, 0, 'Which letter is this sign?', 'J', 'J', 1, 5, '2026-04-05 18:34:09'),
(10, 1, 0, 'Which letter is this sign?', 'H', 'H', 1, 5, '2026-04-05 18:34:09'),
(11, 1, 0, 'Which letter is this sign?', 'B', 'F', 0, 0, '2026-04-05 18:34:21'),
(12, 1, 0, 'Which letter is this sign?', 'I', 'D', 0, 0, '2026-04-05 18:34:21'),
(13, 1, 0, 'Which letter is this sign?', 'E', 'B', 0, 0, '2026-04-05 18:34:21'),
(14, 1, 0, 'Which letter is this sign?', 'D', 'E', 0, 0, '2026-04-05 18:34:21'),
(15, 1, 0, 'Which letter is this sign?', 'F', 'C', 0, 0, '2026-04-05 18:34:21'),
(16, 1, 0, 'Which letter is this sign?', 'L', 'L', 1, 5, '2026-04-05 18:34:34'),
(17, 1, 0, 'Which letter is this sign?', 'M', 'M', 1, 5, '2026-04-05 18:34:34'),
(18, 1, 0, 'Which letter is this sign?', 'B', 'D', 0, 0, '2026-04-05 18:34:34'),
(19, 1, 0, 'Which letter is this sign?', 'A', 'H', 0, 0, '2026-04-05 18:34:34'),
(20, 1, 0, 'Which letter is this sign?', 'I', 'I', 1, 5, '2026-04-05 18:34:34'),
(21, 1, 0, 'Which letter is this sign?', 'E', 'A', 0, 0, '2026-04-05 18:34:46'),
(22, 1, 0, 'Which letter is this sign?', 'K', 'C', 0, 0, '2026-04-05 18:34:46'),
(23, 1, 0, 'Which letter is this sign?', 'F', 'H', 0, 0, '2026-04-05 18:34:46'),
(24, 1, 0, 'Which letter is this sign?', 'I', 'E', 0, 0, '2026-04-05 18:34:46'),
(25, 1, 0, 'Which letter is this sign?', 'M', 'M', 1, 5, '2026-04-05 18:34:46'),
(26, 1, 0, 'Which letter is this sign?', 'M', 'M', 1, 5, '2026-04-05 18:34:57'),
(27, 1, 0, 'Which letter is this sign?', 'D', 'A', 0, 0, '2026-04-05 18:34:57'),
(28, 1, 0, 'Which letter is this sign?', 'H', 'K', 0, 0, '2026-04-05 18:34:57'),
(29, 1, 0, 'Which letter is this sign?', 'F', 'H', 0, 0, '2026-04-05 18:34:57'),
(30, 1, 0, 'Which letter is this sign?', 'G', 'B', 0, 0, '2026-04-05 18:34:57'),
(31, 1, 0, 'Which letter is this sign?', 'L', 'E', 0, 0, '2026-04-05 18:35:07'),
(32, 1, 0, 'Which letter is this sign?', 'C', 'K', 0, 0, '2026-04-05 18:35:07'),
(33, 1, 0, 'Which letter is this sign?', 'I', 'B', 0, 0, '2026-04-05 18:35:07'),
(34, 1, 0, 'Which letter is this sign?', 'B', 'C', 0, 0, '2026-04-05 18:35:07'),
(35, 1, 0, 'Which letter is this sign?', 'A', 'A', 1, 5, '2026-04-05 18:35:07'),
(36, 1, 0, 'Which letter is this sign?', 'J', 'A', 0, 0, '2026-04-05 18:35:17'),
(37, 1, 0, 'Which letter is this sign?', 'E', 'E', 1, 5, '2026-04-05 18:35:17'),
(38, 1, 0, 'Which letter is this sign?', 'F', 'E', 0, 0, '2026-04-05 18:35:17'),
(39, 1, 0, 'Which letter is this sign?', 'G', 'D', 0, 0, '2026-04-05 18:35:17'),
(40, 1, 0, 'Which letter is this sign?', 'M', 'M', 1, 5, '2026-04-05 18:35:17'),
(41, 1, 0, 'Which letter is this sign?', 'K', 'J', 0, 0, '2026-04-05 18:35:27'),
(42, 1, 0, 'Which letter is this sign?', 'B', 'B', 1, 5, '2026-04-05 18:35:27'),
(43, 1, 0, 'Which letter is this sign?', 'G', 'F', 0, 0, '2026-04-05 18:35:27'),
(44, 1, 0, 'Which letter is this sign?', 'D', 'I', 0, 0, '2026-04-05 18:35:27'),
(45, 1, 0, 'Which letter is this sign?', 'H', 'M', 0, 0, '2026-04-05 18:35:27'),
(46, 1, 0, 'Which letter is this sign?', 'D', 'L', 0, 0, '2026-04-05 18:35:37'),
(47, 1, 0, 'Which letter is this sign?', 'K', 'H', 0, 0, '2026-04-05 18:35:37'),
(48, 1, 0, 'Which letter is this sign?', 'G', 'G', 1, 5, '2026-04-05 18:35:37'),
(49, 1, 0, 'Which letter is this sign?', 'J', 'K', 0, 0, '2026-04-05 18:35:37'),
(50, 1, 0, 'Which letter is this sign?', 'M', 'I', 0, 0, '2026-04-05 18:35:37'),
(51, 1, 0, 'Which letter is this sign?', 'L', 'L', 1, 5, '2026-04-05 18:35:46'),
(52, 1, 0, 'Which letter is this sign?', 'A', 'A', 1, 5, '2026-04-05 18:35:46'),
(53, 1, 0, 'Which letter is this sign?', 'H', 'D', 0, 0, '2026-04-05 18:35:46'),
(54, 1, 0, 'Which letter is this sign?', 'E', 'B', 0, 0, '2026-04-05 18:35:46'),
(55, 1, 0, 'Which letter is this sign?', 'B', 'A', 0, 0, '2026-04-05 18:35:46'),
(56, 1, 0, 'Which letter is this sign?', 'J', 'J', 1, 5, '2026-04-05 18:42:01'),
(57, 1, 0, 'Which letter is this sign?', 'B', 'J', 0, 0, '2026-04-05 18:42:01'),
(58, 1, 0, 'Which letter is this sign?', 'H', 'M', 0, 0, '2026-04-05 18:42:01'),
(59, 1, 0, 'Which letter is this sign?', 'E', 'E', 1, 5, '2026-04-05 18:42:01'),
(60, 1, 0, 'Which letter is this sign?', 'K', 'G', 0, 0, '2026-04-05 18:42:01'),
(61, 1, 0, 'Which letter is this sign?', 'M', 'I', 0, 0, '2026-04-06 09:38:51'),
(62, 1, 0, 'Which letter is this sign?', 'K', 'K', 1, 5, '2026-04-06 09:38:51'),
(63, 1, 0, 'Which letter is this sign?', 'A', 'A', 1, 5, '2026-04-06 09:38:51'),
(64, 1, 0, 'Which letter is this sign?', 'D', 'E', 0, 0, '2026-04-06 09:38:51'),
(65, 1, 0, 'Which letter is this sign?', 'G', 'F', 0, 0, '2026-04-06 09:38:51'),
(66, 2, 0, 'Which letter is this sign?', 'C', 'C', 1, 5, '2026-04-08 22:06:10'),
(67, 2, 0, 'Which letter is this sign?', 'I', 'I', 1, 5, '2026-04-08 22:06:10'),
(68, 2, 0, 'Which letter is this sign?', 'A', 'D', 0, 0, '2026-04-08 22:06:10'),
(69, 2, 0, 'Which letter is this sign?', 'F', 'F', 1, 5, '2026-04-08 22:06:10'),
(70, 2, 0, 'Which letter is this sign?', 'J', 'F', 0, 0, '2026-04-08 22:06:10'),
(71, 2, 0, 'Which letter is this sign?', 'A', 'H', 0, 0, '2026-04-08 22:14:33'),
(72, 2, 0, 'Which letter is this sign?', 'G', 'F', 0, 0, '2026-04-08 22:14:33'),
(73, 2, 0, 'Which letter is this sign?', 'K', 'D', 0, 0, '2026-04-08 22:14:33'),
(74, 2, 0, 'Which letter is this sign?', 'I', 'K', 0, 0, '2026-04-08 22:14:33'),
(75, 2, 0, 'Which letter is this sign?', 'D', 'A', 0, 0, '2026-04-08 22:14:33'),
(76, 2, 0, 'Which letter is this sign?', 'E', 'C', 0, 0, '2026-04-08 22:14:45'),
(77, 2, 0, 'Which letter is this sign?', 'M', 'L', 0, 0, '2026-04-08 22:14:45'),
(78, 2, 0, 'Which letter is this sign?', 'B', 'B', 1, 5, '2026-04-08 22:14:45'),
(79, 2, 0, 'Which letter is this sign?', 'G', 'M', 0, 0, '2026-04-08 22:14:45'),
(80, 2, 0, 'Which letter is this sign?', 'J', 'I', 0, 0, '2026-04-08 22:14:45'),
(81, 2, 0, 'Which letter is this sign?', 'L', 'E', 0, 0, '2026-04-08 22:15:07'),
(82, 2, 0, 'Which letter is this sign?', 'A', 'I', 0, 0, '2026-04-08 22:15:07'),
(83, 2, 0, 'Which letter is this sign?', 'K', 'E', 0, 0, '2026-04-08 22:15:07'),
(84, 2, 0, 'Which letter is this sign?', 'M', 'M', 1, 5, '2026-04-08 22:15:07'),
(85, 2, 0, 'Which letter is this sign?', 'F', 'E', 0, 0, '2026-04-08 22:15:07'),
(86, 1, 0, 'Which letter is this sign?', 'G', 'G', 1, 5, '2026-04-09 09:27:11'),
(87, 1, 0, 'Which letter is this sign?', 'E', 'E', 1, 5, '2026-04-09 09:27:11'),
(88, 1, 0, 'Which letter is this sign?', 'M', 'M', 1, 5, '2026-04-09 09:27:11'),
(89, 1, 0, 'Which letter is this sign?', 'J', 'I', 0, 0, '2026-04-09 09:27:11'),
(90, 1, 0, 'Which letter is this sign?', 'D', 'E', 0, 0, '2026-04-09 09:27:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `xp` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `level` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `streak` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `last_active` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `xp`, `level`, `streak`, `last_active`, `created_at`) VALUES
(1, 'Umer Khan', 'uk981968@gmail.com', '$2y$10$a8pHgBEq2a9q3b0DtutDUeaWkmFm/SAWHS4dFDefHF67ZGn9cJe1q', 'user', 135, 2, 2, '2026-04-09', '2026-04-05 18:31:55'),
(2, 'Hitesh Kamble', 'hiteshk67@gmail.com', '$2y$10$Wydte.TtOKQ0FrzIey11OOayw.L1gfkpptUIV/a8jUfCD4HEiplYi', 'admin', 95, 2, 1, '2026-04-08', '2026-04-05 18:38:21'),
(3, 'Naveed Sarguroh', 'naveeds@gmail.com', '$2y$10$JkrP4lNXxp13SJbIQn9kfOzCK/JkDts7.ZBfY4e9UOhihzoddf6t.', 'user', 0, 1, 0, NULL, '2026-04-08 22:35:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_achievements`
--

CREATE TABLE `user_achievements` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `achievement_id` int(10) UNSIGNED NOT NULL,
  `earned_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_achievements`
--

INSERT INTO `user_achievements` (`id`, `user_id`, `achievement_id`, `earned_at`) VALUES
(1, 1, 1, '2026-04-05 18:32:43'),
(2, 2, 1, '2026-04-08 22:04:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_ts` (`user_id`,`timestamp`),
  ADD KEY `idx_letter` (`letter`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_lesson` (`user_id`,`lesson_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `practice_sessions`
--
ALTER TABLE `practice_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_date` (`user_id`,`date`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_lesson` (`user_id`,`lesson_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_ach` (`user_id`,`achievement_id`),
  ADD KEY `achievement_id` (`achievement_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `practice_sessions`
--
ALTER TABLE `practice_sessions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_achievements`
--
ALTER TABLE `user_achievements`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `practice_sessions`
--
ALTER TABLE `practice_sessions`
  ADD CONSTRAINT `practice_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
