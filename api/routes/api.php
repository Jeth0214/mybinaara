<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\StaffInvitationController;
use App\Http\Controllers\Api\StoreActivationController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\UserLockController;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureVendorStoreIsActive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum', EnsureAccountIsActive::class, EnsureVendorStoreIsActive::class]);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', EnsureAccountIsActive::class, EnsureVendorStoreIsActive::class])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/regions', [RegionController::class, 'index']);
Route::get('/regions/{region}', [RegionController::class, 'show']);

Route::get('/cities', [CityController::class, 'index']);
Route::get('/cities/{city}', [CityController::class, 'show']);

Route::get('/districts', [DistrictController::class, 'index']);
Route::get('/districts/{district}', [DistrictController::class, 'show']);

Route::post('/stores/activate', [StoreActivationController::class, 'activate']);
Route::post('/staff/accept-invite', [StaffInvitationController::class, 'accept']);

Route::middleware(['auth:sanctum', EnsureAccountIsActive::class, EnsureVendorStoreIsActive::class])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    Route::patch('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus']);

    Route::get('/stores/me', [StoreController::class, 'me']);
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{store}', [StoreController::class, 'show']);
    Route::post('/stores', [StoreController::class, 'store']);
    Route::patch('/stores/{store}', [StoreController::class, 'update']);
    Route::delete('/stores/{store}', [StoreController::class, 'destroy']);
    Route::patch('/stores/{store}/status', [StoreController::class, 'updateStatus']);
    Route::patch('/stores/{store}/location', [StoreController::class, 'updateLocation']);
    Route::post('/stores/{store}/logo', [StoreController::class, 'updateLogo']);
    Route::put('/stores/{store}/schedule', [StoreController::class, 'updateSchedule']);

    Route::get('/staff', [StaffController::class, 'index']);
    Route::get('/staff/{staff}', [StaffController::class, 'show']);
    Route::post('/staff', [StaffController::class, 'store']);
    Route::patch('/staff/{staff}', [StaffController::class, 'update']);
    Route::patch('/staff/{staff}/status', [StaffController::class, 'updateStatus']);
    Route::delete('/staff/{staff}', [StaffController::class, 'destroy']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::patch('/products/{product}/status', [ProductController::class, 'updateStatus']);

    Route::get('/permissions', [PermissionController::class, 'index']);

    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);

    Route::patch('/users/{user}/unlock', [UserLockController::class, 'unlock']);
});
