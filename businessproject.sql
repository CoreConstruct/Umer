-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2026 at 05:02 PM
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
-- Database: `businessproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `admin_email` varchar(255) DEFAULT NULL,
  `admin_name` varchar(255) DEFAULT NULL,
  `admin_number` varchar(255) DEFAULT NULL,
  `admin_password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `admin_email`, `admin_name`, `admin_number`, `admin_password`) VALUES
(1, 'admin@gmail.com', 'Terna Admin', '8729401837', 'qwerty');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `o_id` int(11) NOT NULL,
  `o_name` varchar(255) DEFAULT NULL,
  `o_price` double NOT NULL,
  `o_quantity` int(11) NOT NULL,
  `order_date` datetime(6) DEFAULT NULL,
  `total_ammout` double NOT NULL,
  `user_u_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`o_id`, `o_name`, `o_price`, `o_quantity`, `order_date`, `total_ammout`, `user_u_id`) VALUES
(1, 'Laptop Order', 55000, 1, '2026-01-26 08:23:16.000000', 55000, 1),
(2, 'Laptop', 55000, 2, '2026-01-26 14:13:52.000000', 110000, 1),
(3, 'Mouse', 500, 2, '2026-01-26 14:15:36.000000', 1000, 1),
(52, 'Neem Sapling', 140, 1, '2026-04-08 19:52:06.000000', 140, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders_seq`
--

CREATE TABLE `orders_seq` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders_seq`
--

INSERT INTO `orders_seq` (`next_val`) VALUES
(151),
(2);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `pid` int(11) NOT NULL,
  `pdescription` varchar(255) DEFAULT NULL,
  `pname` varchar(255) DEFAULT NULL,
  `pprice` double NOT NULL,
  `image_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`pid`, `pdescription`, `pname`, `pprice`, `image_name`) VALUES
(1, 'A fast-growing medicinal tree known for its air-purifying and antibacterial properties.', 'Neem Sapling', 140, NULL),
(2, 'A tropical fruit tree that produces sweet, juicy mangoes and thrives in warm climates.', 'Mango Sapling', 340, NULL),
(3, 'A sacred medicinal plant valued for its healing and immunity-boosting benefits.', 'Tulsi (Holy Basil) Sapling', 500, NULL),
(4, 'A hardy fruit tree that yields nutritious guavas and requires minimal maintenance.', 'Guava Sapling', 150, NULL),
(5, 'A compact citrus plant ideal for home gardens, producing fresh, tangy lemons.', 'Lemon Sapling', 160, NULL),
(6, 'A long-living tree known for improving air quality and its cultural significance.', 'Peepal Sapling', 210, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `u_id` int(11) NOT NULL,
  `uemail` varchar(255) DEFAULT NULL,
  `uname` varchar(255) DEFAULT NULL,
  `unumber` bigint(20) DEFAULT NULL,
  `upassword` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`u_id`, `uemail`, `uname`, `unumber`, `upassword`) VALUES
(1, 'akashdubey15@gmail.com', 'Akash', 9372630173, 'qwerty'),
(4, 'umerkhan05@gmail.com', 'Umer Khan', 9702461695, 'Umerkhan@12'),
(9, 'hiteshk@gmail.com', 'Hitesh Kamble', 123456789, 'qwerty'),
(10, 'hiteshk@gmail.com', 'Hitesh Kamble', 123456789, 'qwerty');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`o_id`),
  ADD KEY `FKptqipmq20a4fu25ltvnaleigy` (`user_u_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`pid`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`u_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `pid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `u_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FKptqipmq20a4fu25ltvnaleigy` FOREIGN KEY (`user_u_id`) REFERENCES `user` (`u_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
