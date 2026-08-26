<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FavoritesController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\ListingViewController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// Public listing routes
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Listings (CRUD)
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
    Route::get('/my/listings', [ListingController::class, 'my']);

    // Favorites
    Route::get('/favorites', [FavoritesController::class, 'index']);
    Route::post('/favorites/{listing}', [FavoritesController::class, 'toggle']);
    Route::delete('/favorites/{listing}', [FavoritesController::class, 'destroy']);

    // Listing views
    Route::post('/listings/{listing}/view', [ListingViewController::class, 'record']);
    Route::get('/listings/{listing}/views/monthly', [ListingViewController::class, 'monthlyCount']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{userId}', [MessageController::class, 'conversation']);
    Route::post('/messages', [MessageController::class, 'send']);
    Route::get('/messages/unread/count', [MessageController::class, 'unreadCount']);
});
