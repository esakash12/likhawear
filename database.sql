-- Zinnia Fashion & Lifestyle E-Commerce
-- MySQL Database Dump for cPanel phpMyAdmin Import
-- Created: 2026-09-08 21:56:33

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `personal_access_tokens`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `image` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subcategories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`subcategories`)),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `discount_percent` int(11) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_top_selling` tinyint(1) NOT NULL DEFAULT 0,
  `rating` decimal(3,2) NOT NULL DEFAULT 5.00,
  `reviews_count` int(11) NOT NULL DEFAULT 0,
  `in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `stock_count` int(11) NOT NULL DEFAULT 10,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `colors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`colors`)),
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `description_en` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_bn` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `variants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variants`)),
  `product_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_info`)),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Home',
  `delivery_note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `courier_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consignment_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `courier_tracking_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `courier_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `selected_color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `selected_size` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_trackings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_trackings`;
CREATE TABLE `order_trackings` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_trackings_order_id_foreign` (`order_id`),
  CONSTRAINT `order_trackings_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `coupons`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `discount_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_order` decimal(10,2) NOT NULL DEFAULT 0.00,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cms_contents`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cms_contents`;
CREATE TABLE `cms_contents` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`)),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping data
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES (1, 'Zinnia Admin', 'admin@zinniabd.com', 'admin', '$2y$12$sXK0Lm/FpHSUIgj3a03OuuAWDE83fBFBEyJwJvmyzMsUMqZofVOi.');
INSERT INTO `categories` (`id`, `name`, `slug`, `image`, `subcategories`) VALUES ('cat-men', 'MEN', 'men', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', '[{\"name\":\"Polo T-Shirts\",\"group\":\"Topwear\"},{\"name\":\"Casual Shirts\",\"group\":\"Topwear\"},{\"name\":\"Jeans & Pants\",\"group\":\"Bottomwear\"},{\"name\":\"Watches\",\"group\":\"Watches\"}]');
INSERT INTO `categories` (`id`, `name`, `slug`, `image`, `subcategories`) VALUES ('cat-women', 'WOMEN', 'women', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', '[{\"name\":\"Dresses\",\"group\":\"Clothing\"},{\"name\":\"Tops\",\"group\":\"Clothing\"},{\"name\":\"Sarees\",\"group\":\"Clothing\"},{\"name\":\"Heels & Sandals\",\"group\":\"Footwear\"},{\"name\":\"Bags\",\"group\":\"Bags\"}]');
INSERT INTO `categories` (`id`, `name`, `slug`, `image`, `subcategories`) VALUES ('cat-accessories', 'ACCESSORIES', 'accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', '[{\"name\":\"Wallets\",\"group\":\"Fashion Accessories\"},{\"name\":\"Belts\",\"group\":\"Fashion Accessories\"},{\"name\":\"Sunglasses\",\"group\":\"Fashion Accessories\"},{\"name\":\"Perfumes\",\"group\":\"Beauty\"},{\"name\":\"Body Mists\",\"group\":\"Beauty\"}]');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-1', 'Men\'s Casual Button Down Shirt', 'mens-casual-button-down-shirt', 'MEN', 'Casual Shirts', 550.000000, 600, 8, 1, 1, 4.800000, 38, 1, 16, 'SHIRT-BTN-RED-L', '[{\"name\":\"Red\",\"hex\":\"#7A2222\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Olive\",\"hex\":\"#556B2F\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80\"}]', '[\"M\",\"L\",\"XL\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80\"]', 'Stylish men\'s maroon casual button-down shirt, perfect for everyday wear, office casual, outings, and smart casual styling. The shirt features a classic collar, front button closure, single chest pocket, and long sleeves with a clean rolled-up look. Its deep maroon color gives a premium and elegant appearance that pairs well with jeans, chinos, or formal pants.', 'পুরুষদের জন্য প্রিমিয়াম সুতি মারুন ক্যাজুয়াল বাটন-ডাউন শার্ট। দৈনন্দিন ব্যবহার, অফিস ক্যাজুয়াল, আউটিং বা স্মার্ট ক্যাজুয়াল লুকের জন্য উপযুক্ত। ক্লাসিক কলার, সামনের বাটন ক্লোজার এবং একটি বুক পকেটের সাথে নিখুঁত ফিনিশিং।', '[\"men\'s maroon shirt\",\"casual button down shirt\",\"men casual shirt\",\"long sleeve shirt\",\"gents shirt\",\"maroon casual shirt\",\"Zinnia men\'s fashion\"]', '{\"Product Type\":\"Casual Shirt\",\"Gender\":\"Men\",\"Color\":\"Maroon, Olive\",\"Sleeve Type\":\"Long Sleeve\",\"Collar Type\":\"Classic Collar\",\"Fabric\":\"100% Breathable Combed Cotton\",\"Fit\":\"Regular Comfort Fit\",\"Care Instructions\":\"Machine wash cold with like colors, do not bleach\"}', '{\"Product Type\":\"Variable\",\"Category\":\"MEN\",\"SKU\":\"Shirt Olive L\",\"Stock Status\":\"In Stock (16 available)\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-2', 'Premium Cotton Crew Neck T-Shirt for Men', 'premium-cotton-crew-neck-t-shirt-for-men', 'MEN', 'Polo T-Shirts', 450.000000, 500, 10, 1, 1, 4.900000, 52, 1, 24, 'TSHIRT-CREW-NVY', '[{\"name\":\"Navy Blue\",\"hex\":\"#1E293B\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Burgundy\",\"hex\":\"#6A1A24\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80\"}]', '[\"S\",\"M\",\"L\",\"XL\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80\"]', 'Experience supreme comfort with our heavy-gauge 100% organic cotton crew neck t-shirt. Specially pre-shrunk and bio-washed for lasting softness and zero color bleeding.', '১০০% প্রিমিয়াম অর্গানিক সুতি গোলগলা টি-শার্ট। নরম ও দীর্ঘস্থায়ী ফেব্রিকে নিখুঁত সেলাই।', '[\"cotton t-shirt\",\"men crew neck\",\"navy t-shirt\",\"summer casual\"]', '{\"Product Type\":\"Crew Neck T-Shirt\",\"Fabric\":\"100% Bio-washed Cotton (190 GSM)\",\"Fit\":\"Regular Fit\",\"Neck\":\"Ribbed Crew Neck\"}', '{\"Product Type\":\"Simple\",\"Category\":\"MEN\",\"SKU\":\"TSHIRT-CREW-NVY-L\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-3', 'Premium Elegant Perfume - Golden Amber', 'premium-elegant-perfume-golden-amber', 'ACCESSORIES', 'Perfumes', 500.000000, 600, 17, 1, 1, 4.900000, 44, 1, 18, 'PERF-GLD-AMBER-50', '[{\"name\":\"Golden Amber\",\"hex\":\"#D99B26\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80\"}]', '[\"50ml\",\"100ml\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80\"]', 'An alluring oriental and woody fragrance capturing warm amber, subtle vanilla notes, and cedarwood undertones. Long-lasting luxury projection designed for evening sophistication.', 'দীর্ঘস্থায়ী সুবাসের প্রিমিয়াম পারফিউম। উষ্ণ অ্যাম্বার ও চন্দন কাঠের মনোমুগ্ধকর সুগন্ধ।', '[\"perfume\",\"fragrance\",\"golden amber\",\"accessories\",\"luxury\"]', '{\"Product Type\":\"Eau De Parfum (EDP)\",\"Longevity\":\"8 to 12 Hours\",\"Notes\":\"Amber, Vanilla, Citrus, Cedarwood\",\"Volume\":\"50ml Flacon\"}', '{\"Product Type\":\"Simple\",\"Category\":\"ACCESSORIES\",\"SKU\":\"PERF-GLD-AMBER\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-4', 'Classic Leather Strap Analog Watch', 'classic-leather-strap-analog-watch', 'ACCESSORIES', 'Watches', 2100.000000, 2198, 4, 1, 1, 4.700000, 19, 1, 9, 'WATCH-LTHR-BRN', '[{\"name\":\"Dark Tan Leather\",\"hex\":\"#8B4513\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80\"}]', '[\"Standard Dial 40mm\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80\"]', 'Timeless analog wrist watch featuring genuine textured leather strap, mineral glass dial, water-resistant casing, and precision Japanese quartz movement.', 'জেনুইন লেদার স্ট্র্যাপ ও প্রিসিশন কোয়ার্টজ মুভমেন্টের ক্লাসিক অ্যানালগ ঘড়ি।', '[\"watch\",\"leather watch\",\"analog watch\",\"accessories\"]', '{\"Dial Diameter\":\"40 mm\",\"Strap Material\":\"Genuine Calfskin Leather\",\"Movement\":\"Japanese Quartz\",\"Water Resistance\":\"3 ATM \\/ 30m splash-proof\"}', '{\"Product Type\":\"Simple\",\"Category\":\"ACCESSORIES\",\"SKU\":\"WATCH-LTHR-BRN-01\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-5', 'Ladies Premium Top Handle Handbag', 'ladies-premium-top-handle-handbag', 'ACCESSORIES', 'Bags', 800.000000, 900, 11, 1, 1, 4.900000, 31, 1, 12, 'BAG-HND-BEIGE', '[{\"name\":\"Beige Cream\",\"hex\":\"#D2B48C\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Tan Caramel\",\"hex\":\"#966F33\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80\"}]', '[\"Medium 28cm x 20cm\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80\"]', 'Chic structured top-handle handbag made with premium textured vegan leather, elegant gold-plated hardware, multiple interior organizers, and detachable shoulder strap.', 'প্রিমিয়াম টেক্সচার্ড লেদারের মহিলাদের হ্যান্ডব্যাগ। আরামদায়ক হাতল ও গর্জিয়াস লুক।', '[\"handbag\",\"women bag\",\"tote\",\"fashion accessories\"]', '{\"Material\":\"Structured PU Leather\",\"Closure\":\"Metallic Lock Clasp\",\"Compartments\":\"2 main, 1 zippered inner pocket\"}', '{\"Product Type\":\"Variable\",\"Category\":\"ACCESSORIES\",\"SKU\":\"BAG-HND-BEIGE\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-6', 'Men\'s Classic Chino Pant', 'mens-classic-chino-pant', 'MEN', 'Jeans & Pants', 700.000000, 800, 13, 1, 1, 4.800000, 27, 1, 14, 'CHINO-MEN-KHK', '[{\"name\":\"Khaki Beige\",\"hex\":\"#C3B091\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Olive Gray\",\"hex\":\"#708238\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80\"}]', '[\"30\",\"32\",\"34\",\"36\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80\"]', 'Tailored slim-straight fit stretch chinos designed for everyday versatility. Crafted from soft cotton twill with 2% elastane for maximum flexibility and breathability.', 'স্ট্রেচ কটন টুইল কাপড়ের ক্লাসিক চিনো প্যান্ট। অফিস ও ক্যাজুয়াল ব্যবহারের উপযোগী।', '[\"chino pant\",\"men trousers\",\"khaki pants\",\"formal casual\"]', '{\"Fabric\":\"98% Cotton, 2% Spandex Twill\",\"Fit\":\"Slim Straight Fit\",\"Pockets\":\"4 Pocket Design\"}', '{\"Product Type\":\"Variable\",\"Category\":\"MEN\",\"SKU\":\"CHINO-MEN-KHK-32\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-7', 'Women\'s Embroidered Cotton Kurti - Mustard & Mint Green', 'womens-embroidered-cotton-kurti-mustard-mint-green', 'WOMEN', 'Tops', 1100.000000, 1200, 8, 1, 1, 4.900000, 65, 1, 11, 'KURTI-EMB-MST', '[{\"name\":\"Mustard Yellow\",\"hex\":\"#E1AD01\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Mint Green\",\"hex\":\"#98FF98\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80\"}]', '[\"36\",\"38\",\"40\",\"42\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80\"]', 'Graceful handcrafted kurti with delicate Kashmiri-inspired neckline threadwork and border detailing. Made from breathable handloom cotton ideal for the Bangladeshi climate.', 'হাতে কাজ করা গলার এমব্রয়ডারি সহ প্রিমিয়াম সুতি কুর্তি। মার্জিত ও আরামদায়ক।', '[\"kurti\",\"women cotton kurti\",\"embroidered kurti\",\"ethnic wear\"]', '{\"Fabric\":\"100% Handloom Cotton\",\"Work\":\"Fine Resham Thread Embroidery\",\"Length\":\"Knee Length 42 inches\"}', '{\"Product Type\":\"Variable\",\"Category\":\"WOMEN\",\"SKU\":\"KURTI-EMB-MST-38\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-8', 'Women\'s Embroidered Three Piece Set - Dusty Blue & Dusty Pink', 'womens-embroidered-three-piece-set-dusty-blue-dusty-pink', 'WOMEN', 'Dresses', 1600.000000, 2000, 20, 1, 1, 5.000000, 48, 1, 8, '3PCS-EMB-DBL', '[{\"name\":\"Dusty Blue\",\"hex\":\"#6B8E23\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Dusty Pink\",\"hex\":\"#DDA0DD\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80\"}]', '[\"M (38)\",\"L (40)\",\"XL (42)\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80\"]', 'Complete 3-piece luxury ensemble comprising heavily embroidered kamiz, straight cut cigarette pants, and a semi-sheer tissue organza dupatta with intricate lace borders.', 'খুব সুন্দর সূচিকর্মের কামিজ, প্যান্ট ও অর্গানজা ওড়না সহ সম্পূর্ণ থ্রি-পিস সেট।', '[\"three piece\",\"salwar kameez\",\"embroidered dress\",\"eid collection\"]', '{\"Kamiz Fabric\":\"Pure Slub Cotton with Zari Embroidery\",\"Dupatta\":\"Silk Organza with Cutwork Lace\",\"Pant\":\"Stretch Cotton Trouser\"}', '{\"Product Type\":\"Variable\",\"Category\":\"WOMEN\",\"SKU\":\"3PCS-EMB-DBL-40\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-9', 'Classic Leather Style Wallet - Tan & Dark Brown', 'classic-leather-style-wallet-tan-dark-brown', 'ACCESSORIES', 'Wallets', 600.000000, 700, 14, 1, 1, 4.800000, 22, 1, 25, 'WLT-LTHR-BRN', '[{\"name\":\"Tan Brown\",\"hex\":\"#A0522D\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80\"}]', '[\"Bi-Fold Standard\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80\"]', 'Refined bi-fold men\'s wallet with RFID blocking technology, 8 card slots, 2 full cash compartments, and a transparent photo ID window.', 'জেনুইন লেদারের আরএফআইডি প্রটেক্টেড আধুনিক মানিব্যাগ।', '[\"wallet\",\"leather wallet\",\"men accessories\"]', '{\"Material\":\"Full Grain Leather\",\"Slots\":\"8 Cards, 2 Currency, 1 ID\",\"Feature\":\"RFID Blocking Protection\"}', '{\"Product Type\":\"Simple\",\"Category\":\"ACCESSORIES\",\"SKU\":\"WLT-LTHR-BRN-01\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-10', 'Classic Wayfarer Sunglasses - Tortoise Brown & Black', 'classic-wayfarer-sunglasses-tortoise-brown-black', 'ACCESSORIES', 'Sunglasses', 600.000000, 700, 14, 1, 1, 4.600000, 17, 1, 15, 'SUN-WAYF-BRN', '[{\"name\":\"Tortoise Brown\",\"hex\":\"#5C3317\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80\"}]', '[\"Medium Unisex Frame\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80\"]', 'Timeless wayfarer sunglasses with UV400 polarized protective lenses and durable lightweight acetate frame. Includes protective case and micro-fiber cloth.', 'ইউভি ৪০০ প্রোটেকশন পোলারাইজড লেন্সের স্টাইলিশ সানগ্লাস।', '[\"sunglasses\",\"wayfarer\",\"shades\",\"accessories\"]', '{\"Lens\":\"Polarized UV400 Protection\",\"Frame Material\":\"Handcrafted Acetate\",\"Gender\":\"Unisex\"}', '{\"Product Type\":\"Simple\",\"Category\":\"ACCESSORIES\",\"SKU\":\"SUN-WAYF-BRN\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-11', 'Women\'s Embroidered Party Wear Saree - Maroon & Royal Blue', 'womens-embroidered-party-wear-saree-maroon-royal-blue', 'WOMEN', 'Sarees', 2500.000000, 3000, 17, 1, 1, 5.000000, 42, 1, 7, 'SAREE-PTY-MRN', '[{\"name\":\"Royal Maroon\",\"hex\":\"#800000\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Royal Blue\",\"hex\":\"#002366\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80\"}]', '[\"Full 12 Haath Saree + Unstitched Blouse Piece\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80\"]', 'Regal party wear silk saree with grand golden Zari woven anchal and delicate embroidered all-over buti work. Includes matching unstitched blouse fabric.', 'বিয়ে ও উৎসবের জন্য ঐতিহ্যবাহী গর্জিয়াস সিল্ক শাড়ি। জমকালো জরি আঁচল।', '[\"saree\",\"party wear saree\",\"silk saree\",\"bangladeshi saree\"]', '{\"Fabric\":\"Art Semi Silk with Rich Zari Weave\",\"Length\":\"6.3 Meters (Including Blouse)\",\"Occasion\":\"Festive, Wedding, Reception\"}', '{\"Product Type\":\"Variable\",\"Category\":\"WOMEN\",\"SKU\":\"SAREE-PTY-MRN\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `products` (`id`, `title`, `slug`, `category`, `subcategory`, `price`, `compare_at_price`, `discount_percent`, `is_featured`, `is_top_selling`, `rating`, `reviews_count`, `in_stock`, `stock_count`, `sku`, `colors`, `sizes`, `images`, `description_en`, `description_bn`, `tags`, `specifications`, `product_info`) VALUES ('prod-12', 'Men\'s Premium Traditional Panjabi - Ivory White', 'mens-premium-traditional-panjabi-ivory-white', 'MEN', 'Polo T-Shirts', 1850.000000, 2200, 16, 1, 1, 4.900000, 39, 1, 13, 'PANJ-PREM-IVR', '[{\"name\":\"Ivory White\",\"hex\":\"#FFFFF0\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80\"},{\"name\":\"Jet Black\",\"hex\":\"#111111\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80\"}]', '[\"40\",\"42\",\"44\",\"46\"]', '[\"https:\\/\\/images.unsplash.com\\/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80\",\"https:\\/\\/images.unsplash.com\\/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80\"]', 'Exclusive festive cotton silk panjabi adorned with minimal collar and placket thread embroidery, paired with metallic vintage buttons.', 'উৎসবের জন্য আরামদায়ক কটন সিল্কের এক্সক্লুসিভ কাজ করা পাঞ্জাবি।', '[\"panjabi\",\"men traditional\",\"eid panjabi\",\"ivory white\"]', '{\"Fabric\":\"Cotton Silk Blend\",\"Cut\":\"Tailored Semi-Fitting Regular\",\"Embroidery\":\"Hand Thread Embroidered Collar & Placket\"}', '{\"Product Type\":\"Variable\",\"Category\":\"MEN\",\"SKU\":\"PANJ-PREM-IVR-42\",\"Stock Status\":\"In Stock\"}');
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order`, `active`) VALUES (1, 'ZINNIA10', 'percentage', 10.000000, 800.000000, 1);
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order`, `active`) VALUES (2, 'SAVE50', 'fixed', 50.000000, 500.000000, 1);
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order`, `active`) VALUES (3, 'EIDSPECIAL', 'percentage', 15.000000, 2000.000000, 1);
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('siteInfo', '{\"brandName\":\"ZINNIA\",\"brandSubtitle\":\"BANGLADESH\",\"description\":\"Online fashion for shoppers across Bangladesh, with sarees, salwar kameez, kurtis, panjabi, and everyday clothing selected for simple shopping and reliable support.\",\"email\":\"zinniabangladesh@gmail.com\",\"phone\":\"01705568795\",\"whatsappNumber\":\"+8801705568795\",\"address\":\"Cumilla, Bangladesh\",\"workingHours\":\"Saturday - Thursday, 10 AM to 08 PM\",\"announcementTicker\":[\"EASY RETURN\",\"QUALITY CHECKED\",\"FAST DELIVERY\",\"MADE IN BANGLADESH\",\"SECURE CHECKOUT\",\"CASH ON DELIVERY\"]}');
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('heroSlides', '[{\"id\":\"slide-1\",\"eyebrow\":\"DISCOVER. SHOP. SHINE.\",\"title\":\"FAMILY COLLECTION\",\"subtitle\":\"Style for Everyone\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85\",\"ctaText\":\"SHOP NOW\",\"ctaLink\":\"\\/shop\",\"badges\":[\"QUALITY CHECKED\",\"CASH ON DELIVERY\",\"EASY RETURNS\"]},{\"id\":\"slide-2\",\"eyebrow\":\"DISCOVER. SHOP. SHINE.\",\"title\":\"WOMEN\'S COLLECTION\",\"subtitle\":\"Style at Your Fingertips\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85\",\"ctaText\":\"EXPLORE NOW\",\"ctaLink\":\"\\/shop?category=WOMEN\",\"badges\":[\"NEW ARRIVALS\",\"CASH ON DELIVERY\",\"PREMIUM FABRIC\"]},{\"id\":\"slide-3\",\"eyebrow\":\"DISCOVER. SHOP. SHINE.\",\"title\":\"MEN\'S COLLECTION\",\"subtitle\":\"Effortless Elegance\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1920&q=85\",\"ctaText\":\"SHOP MEN\",\"ctaLink\":\"\\/shop?category=MEN\",\"badges\":[\"BEST PRICES\",\"PURE COTTON\",\"EXPRESS SHIPPING\"]}]');
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('categoryHighlights', '{\"title\":\"Shop by Category\",\"subtitle\":\"Discover our main collections and find exactly what you\'re looking for.\"}');
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('lookbook', '{\"eyebrow\":\"STYLE GALLERY\",\"title\":\"Zinnia Lookbook\",\"subtitle\":\"Style inspiration from our latest collections\",\"items\":[{\"id\":\"look-1\",\"title\":\"Timeless Elegance\",\"subtitle\":\"Traditional aesthetics crafted with modern silhouettes\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80\",\"link\":\"\\/shop?category=WOMEN\",\"buttonText\":\"Explore Collection\"},{\"id\":\"look-2\",\"title\":\"Everyday Chic\",\"subtitle\":\"Effortless casuals for modern women on the go\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80\",\"link\":\"\\/shop?category=WOMEN\",\"buttonText\":\"Explore Collection\"},{\"id\":\"look-3\",\"title\":\"Effortless Style\",\"subtitle\":\"Crisp shirts, chinos, and refined panjabis for men\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80\",\"link\":\"\\/shop?category=MEN\",\"buttonText\":\"Shop Men\"}]}');
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('zinniaStandard', '{\"eyebrow\":\"THE ZINNIA STANDARD\",\"title\":\"Crafted with Love & Tradition\",\"description\":\"We blend authentic materials with modern elegance, ensuring every piece reflects our rich heritage of Bangladeshi craftsmanship.\",\"features\":[{\"id\":\"feat-1\",\"title\":\"Quality Checked\",\"desc\":\"Every piece is meticulously inspected before dispatch to ensure fabric, stitching, finishing, and packaging exceed expectations.\",\"iconName\":\"ShieldCheck\"},{\"id\":\"feat-2\",\"title\":\"Cash on Delivery\",\"desc\":\"Shop with confidence and ease. Pay securely only when your beautiful garments arrive safely at your doorstep.\",\"iconName\":\"Banknote\"},{\"id\":\"feat-3\",\"title\":\"Effortless Returns\",\"desc\":\"Your satisfaction is our priority. If an item isn\'t quite right, our return and exchange process is delightfully simple.\",\"iconName\":\"RotateCcw\"},{\"id\":\"feat-4\",\"title\":\"Dedicated Support\",\"desc\":\"Questions about sizing or delivery? Our dedicated styling and support team is always here to assist you promptly.\",\"iconName\":\"Headphones\"}]}');
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('faqs', '{\"eyebrow\":\"FREQUENTLY ASKED QUESTIONS\",\"title\":\"Shopping with Zinnia\",\"items\":[{\"id\":\"faq-1\",\"question\":\"Does Zinnia deliver across Bangladesh?\",\"answer\":\"Yes! We proudly deliver to all 64 districts across Bangladesh via trusted courier partners (Steadfast, Pathao, RedX, and eCourier). Standard delivery takes 2-3 business days inside Dhaka and 3-5 business days outside Dhaka.\"},{\"id\":\"faq-2\",\"question\":\"Is cash on delivery available on Zinnia?\",\"answer\":\"Yes, Cash on Delivery (COD) is available nationwide for all our customers without any advance fee required for standard retail orders.\"},{\"id\":\"faq-3\",\"question\":\"What is Zinnia\'s return and exchange policy?\",\"answer\":\"We offer a 7-day hassle-free return and exchange guarantee. If an item has size mismatch or manufacturing defect, simply contact our support line or message us on WhatsApp with your Order ID.\"},{\"id\":\"faq-4\",\"question\":\"How can I track my order?\",\"answer\":\"Click on \'Track your order\' in our top menu or bottom bar, enter your Order Number (e.g. ZN-260520-ABCD) along with the phone number used at checkout to see real-time updates.\"}]}');
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('policies', '{\"aboutUs\":\"### Welcome to Zinnia Bangladesh\\n\\nZinnia is Bangladesh\'s premier destination for thoughtfully curated modern and traditional apparel. Founded with the mission to bring authentic craftsmanship directly to conscious shoppers, we celebrate our rich heritage with contemporary sensibilities.\\n\\nFrom handloom kurtis and majestic festive sarees to sharp casual button-downs and tailored chinos, each creation is crafted using carefully sourced materials, rigorous stitching inspections, and sustainable packaging.\\n\\nWe operate our main hub in **Cumilla, Bangladesh**, serving discerning customers nationwide from Sylhet to Chattogram, Dhaka to Rajshahi.\",\"termsAndConditions\":\"### Terms & Conditions\\n\\n1. **Ordering & Acceptance**: Placing an order constitutes an offer to purchase. We reserve the right to verify order details via telephone or SMS before dispatch.\\n2. **Pricing & Availability**: All prices are listed in Bangladeshi Taka (BDT \\/ Tk) inclusive of applicable taxes.\\n3. **Cash on Delivery**: Please ensure you or an authorized representative is present with the exact cash amount upon delivery.\\n4. **Cancellations**: Orders can be canceled free of charge before they enter the \'Shipped\' status.\",\"privacyPolicy\":\"### Privacy & Cookie Policy\\n\\nYour personal information (name, phone number, delivery address) is strictly collected solely for order fulfillment, courier delivery notification, and customer support. We do not sell, rent, or lease customer data to any third-party advertisers.\",\"shippingPolicy\":\"### Delivery & Shipping Policy\\n\\n- **Inside Dhaka**: Tk 60 delivery fee (Delivered within 24-48 hours)\\n- **Outside Dhaka**: Tk 130 delivery fee (Delivered within 2-4 business days across all 64 districts)\\n- **Free Shipping**: Available for orders over Tk 3,000!\\n- **Real-time Tracking**: Every customer receives an SMS and can track live status directly through our website.\",\"refundPolicy\":\"### Refund & Exchange Policy\\n\\nIf you receive an item with a manufacturing defect, damaged packaging, or incorrect size:\\n1. Notify us within 48 hours of receipt via WhatsApp at +8801705568795.\\n2. Keep tags attached and garments unworn.\\n3. We will arrange a doorstep exchange or process your refund via bKash \\/ bank transfer within 3-5 business days.\",\"contactUs\":\"### Contact Zinnia Customer Care\\n\\nWe are always delighted to assist you with styling advice, sizing inquiries, or order status.\\n\\n- **Helpline Phone**: 01705568795\\n- **WhatsApp Support**: +8801705568795\\n- **Email**: zinniabangladesh@gmail.com\\n- **Store Location**: Cumilla, Bangladesh\\n- **Customer Support Hours**: Saturday - Thursday, 10:00 AM to 08:00 PM (Friday Closed)\"}');
INSERT INTO `cms_contents` (`key`, `value`) VALUES ('shipping', '{\"insideDhakaFee\":60,\"outsideDhakaFee\":130,\"freeShippingThreshold\":3000,\"estimatedDeliveryDays\":\"2-5 business days\"}');

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
