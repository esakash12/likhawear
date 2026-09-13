<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use App\Models\CmsContent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Admin
        User::updateOrCreate(
            ['email' => 'admin@zinniabd.com'],
            [
                'name' => 'Zinnia Admin',
                'password' => Hash::make('admin123456'),
                'role' => 'admin',
            ]
        );

        $jsonPath = database_path('seeders/initial_seed_data.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("Seed data JSON not found at {$jsonPath}");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);

        // 2. Categories
        if (!empty($data['categories'])) {
            foreach ($data['categories'] as $cat) {
                Category::updateOrCreate(
                    ['id' => $cat['id']],
                    [
                        'name' => $cat['name'],
                        'slug' => $cat['slug'],
                        'image' => $cat['image'] ?? null,
                        'subcategories' => $cat['subcategories'] ?? [],
                    ]
                );
            }
        }

        // 3. Products
        if (!empty($data['products'])) {
            foreach ($data['products'] as $prod) {
                Product::updateOrCreate(
                    ['id' => $prod['id']],
                    [
                        'title' => $prod['title'],
                        'slug' => $prod['slug'],
                        'category' => $prod['category'],
                        'subcategory' => $prod['subcategory'] ?? null,
                        'price' => $prod['price'],
                        'compare_at_price' => $prod['compareAtPrice'] ?? null,
                        'discount_percent' => $prod['discountPercent'] ?? 0,
                        'is_featured' => $prod['isFeatured'] ?? false,
                        'is_top_selling' => $prod['isTopSelling'] ?? false,
                        'rating' => $prod['rating'] ?? 5.0,
                        'reviews_count' => $prod['reviewsCount'] ?? 0,
                        'in_stock' => $prod['inStock'] ?? true,
                        'stock_count' => $prod['stockCount'] ?? 10,
                        'sku' => $prod['sku'] ?? null,
                        'colors' => $prod['colors'] ?? [],
                        'sizes' => $prod['sizes'] ?? [],
                        'images' => $prod['images'] ?? [],
                        'description_en' => $prod['descriptionEn'] ?? '',
                        'description_bn' => $prod['descriptionBn'] ?? '',
                        'tags' => $prod['tags'] ?? [],
                        'specifications' => $prod['specifications'] ?? [],
                        'product_info' => $prod['productInfo'] ?? [],
                    ]
                );
            }
        }

        // 4. Coupons
        if (!empty($data['coupons'])) {
            foreach ($data['coupons'] as $coupon) {
                Coupon::updateOrCreate(
                    ['code' => $coupon['code']],
                    [
                        'discount_type' => $coupon['discountType'],
                        'discount_value' => $coupon['discountValue'],
                        'min_order' => $coupon['minOrder'] ?? 0,
                        'active' => $coupon['active'] ?? true,
                    ]
                );
            }
        }

        // 5. Orders
        if (!empty($data['orders'])) {
            foreach ($data['orders'] as $ord) {
                $order = Order::updateOrCreate(
                    ['id' => $ord['id']],
                    [
                        'customer_name' => $ord['customerName'],
                        'phone' => $ord['phone'],
                        'email' => $ord['email'] ?? null,
                        'district' => $ord['district'],
                        'area' => $ord['area'] ?? '',
                        'address' => $ord['address'],
                        'address_label' => $ord['addressLabel'] ?? 'Home',
                        'delivery_note' => $ord['deliveryNote'] ?? null,
                        'payment_method' => $ord['paymentMethod'] ?? 'cod',
                        'subtotal' => $ord['subtotal'],
                        'delivery_fee' => $ord['deliveryFee'] ?? 0,
                        'discount' => $ord['discount'] ?? 0,
                        'coupon_code' => $ord['couponCode'] ?? null,
                        'total' => $ord['total'],
                        'status' => $ord['status'] ?? 'Pending',
                    ]
                );

                // Items
                $order->items()->delete();
                if (!empty($ord['items'])) {
                    foreach ($ord['items'] as $item) {
                        $order->items()->create([
                            'product_id' => $item['productId'] ?? null,
                            'title' => $item['title'],
                            'price' => $item['price'],
                            'image' => $item['image'] ?? null,
                            'selected_color' => $item['selectedColor'] ?? null,
                            'selected_size' => $item['selectedSize'] ?? null,
                            'quantity' => $item['quantity'] ?? 1,
                        ]);
                    }
                }

                // Tracking
                $order->trackings()->delete();
                if (!empty($ord['trackingEvents'])) {
                    foreach ($ord['trackingEvents'] as $track) {
                        $order->trackings()->create([
                            'status' => $track['status'],
                            'time' => $track['time'],
                            'note' => $track['note'],
                            'location' => $track['location'] ?? null,
                        ]);
                    }
                }
            }
        }

        // 6. CMS Contents
        if (!empty($data['cms'])) {
            foreach ($data['cms'] as $key => $val) {
                CmsContent::updateOrCreate(
                    ['key' => $key],
                    ['value' => $val]
                );
            }
        }
    }
}
