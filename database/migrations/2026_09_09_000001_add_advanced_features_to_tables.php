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
        // Add new columns to users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('google_id');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('avatar');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('phone');
            }
        });

        // Add courier and customer tracking to orders
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('orders', 'courier_name')) {
                $table->string('courier_name')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('orders', 'consignment_id')) {
                $table->string('consignment_id')->nullable()->after('courier_name');
            }
            if (!Schema::hasColumn('orders', 'courier_tracking_code')) {
                $table->string('courier_tracking_code')->nullable()->after('consignment_id');
            }
            if (!Schema::hasColumn('orders', 'courier_status')) {
                $table->string('courier_status')->nullable()->after('courier_tracking_code');
            }
        });

        // Add variants matrix to products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'variants')) {
                $table->json('variants')->nullable()->after('specifications');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'avatar', 'phone', 'address']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'courier_name', 'consignment_id', 'courier_tracking_code', 'courier_status']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['variants']);
        });
    }
};
