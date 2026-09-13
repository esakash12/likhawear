<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\CmsController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CourierController;

/*
|--------------------------------------------------------------------------
| Public Storefront Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/customer/register', [AuthController::class, 'register']);
Route::post('/auth/google', [AuthController::class, 'loginWithGoogle']);
Route::post('/customer/google-login', [AuthController::class, 'loginWithGoogle']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/track/{idOrPhone}', [OrderController::class, 'track']);

Route::post('/coupons/apply', [CouponController::class, 'apply']);
Route::get('/cms', [CmsController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated Customer Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/customer/profile', [AuthController::class, 'customerProfile']);
    Route::put('/customer/profile', [AuthController::class, 'updateCustomerProfile']);
    Route::get('/customer/orders', [AuthController::class, 'customerOrders']);
});

/*
|--------------------------------------------------------------------------
| Protected Admin & Staff Routes (Sanctum Authenticated + Role Enforced)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role'])->group(function () {
    // Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Products CRUD
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Categories
    Route::post('/categories', [CategoryController::class, 'store']);

    // Admin Orders Management & Courier Dispatch
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/admin/orders/{id}/tracking', [OrderController::class, 'addTrackingEvent']);
    Route::post('/admin/orders/{id}/dispatch-courier', [CourierController::class, 'dispatchSteadfast']);
    Route::get('/admin/orders/{id}/courier-status', [CourierController::class, 'checkStatus']);

    // Admin Coupons
    Route::get('/admin/coupons', [CouponController::class, 'index']);
    Route::post('/admin/coupons', [CouponController::class, 'store']);
    Route::delete('/admin/coupons/{code}', [CouponController::class, 'destroy']);

    // CMS Settings
    Route::post('/admin/cms', [CmsController::class, 'update']);

    // Image Upload
    Route::post('/admin/upload', [UploadController::class, 'upload']);

    // Staff User Management (Restricted strictly to super admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::post('/admin/users', [UserController::class, 'store']);
        Route::put('/admin/users/{id}', [UserController::class, 'update']);
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    });
});
