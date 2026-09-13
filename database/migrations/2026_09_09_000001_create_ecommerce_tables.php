<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'cat-men', 'cat-women'
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('image')->nullable();
            $table->json('subcategories')->nullable();
            $table->timestamps();
        });

        // 2. Products
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'prod-1'
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->integer('discount_percent')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_top_selling')->default(false);
            $table->decimal('rating', 3, 2)->default(5.0);
            $table->integer('reviews_count')->default(0);
            $table->boolean('in_stock')->default(true);
            $table->integer('stock_count')->default(10);
            $table->string('sku')->nullable();
            $table->json('colors')->nullable();
            $table->json('sizes')->nullable();
            $table->json('images')->nullable();
            $table->longText('description_en')->nullable();
            $table->longText('description_bn')->nullable();
            $table->json('tags')->nullable();
            $table->json('specifications')->nullable();
            $table->json('product_info')->nullable();
            $table->timestamps();
        });

        // 3. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'ZN-2026-9481'
            $table->string('customer_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('district');
            $table->string('area')->nullable();
            $table->text('address');
            $table->string('address_label')->default('Home');
            $table->text('delivery_note')->nullable();
            $table->string('payment_method')->default('cod'); // cod or bkash
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->string('coupon_code')->nullable();
            $table->decimal('total', 10, 2);
            $table->string('status')->default('Pending'); // Pending, Confirmed, Processing, Shipped, Delivered, Cancelled
            $table->timestamps();
        });

        // 4. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->string('product_id')->nullable();
            $table->string('title');
            $table->decimal('price', 10, 2);
            $table->text('image')->nullable();
            $table->string('selected_color')->nullable();
            $table->string('selected_size')->nullable();
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });

        // 5. Order Tracking Events
        Schema::create('order_trackings', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->string('status');
            $table->string('time');
            $table->text('note');
            $table->string('location')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });

        // 6. Coupons
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('discount_type')->default('percentage'); // percentage or fixed
            $table->decimal('discount_value', 10, 2);
            $table->decimal('min_order', 10, 2)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 7. CMS Content (Key-Value storage for banner, lookbook, policies, site info)
        Schema::create('cms_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_contents');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('order_trackings');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
