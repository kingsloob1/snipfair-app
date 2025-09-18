<?php

use App\Http\Controllers\LocationServiceController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Customer booking API routes
Route::middleware(['web', 'auth:web'])->prefix('customer')->group(function () {
    Route::get('/booking-status/{portfolioId}', 'App\Http\Controllers\Customer\AppointmentController@getBookingStatus');
    Route::post('/create-appointment', 'App\Http\Controllers\Customer\AppointmentController@createAppointment');
    Route::post('/update-appointment-statuses', 'App\Http\Controllers\Customer\AppointmentController@updateAppointmentStatuses');
    Route::post('/update-appointment', 'App\Http\Controllers\Customer\AppointmentController@update');
});

// Admin API routes
Route::middleware(['web', 'auth:web'])->prefix('admin')->group(function () {
    Route::get('/pending-payments', 'App\Http\Controllers\Admin\PaymentController@getPendingPayments');
    Route::post('/verify-payment', 'App\Http\Controllers\Admin\PaymentController@verifyPayment');
});

// Stylist API routes
Route::middleware(['web', 'auth:web'])->prefix('stylist')->group(function () {
    Route::get('/pending-appointments', 'App\Http\Controllers\Stylist\AppointmentController@getPendingAppointments');
    Route::post('/approve-appointment', 'App\Http\Controllers\Stylist\AppointmentController@approveAppointment');
    Route::post('/confirm-meetup', 'App\Http\Controllers\Stylist\AppointmentController@confirmMeetup');
    Route::post('/complete-appointment', 'App\Http\Controllers\Stylist\AppointmentController@completeAppointment');
    Route::post('/process-subscription-payment', 'App\Http\Controllers\Stylist\SubscriptionController@processSubscriptionPayment');
    Route::post('/update-availability', 'App\Http\Controllers\Stylist\SubscriptionController@updateAvailability');
    Route::get('/appointment-status/{appointmentId}', 'App\Http\Controllers\Stylist\AppointmentController@getAppointment');
    Route::post('/update-appointment', 'App\Http\Controllers\Stylist\AppointmentController@updateAppointment');
});

Route::middleware(['web', 'auth:web'])->group(function () {
    Route::post('/location-consent', [LocationServiceController::class, 'recordLocationConsent']);
    Route::get('/location-consent-status', [LocationServiceController::class, 'getLocationConsentStatus']);
    Route::post('/update-location', [LocationServiceController::class, 'updateLocation']);
    Route::post('/ip-location', [LocationServiceController::class, 'updateIPLocation']);
    Route::post('/distance/{user}', [LocationServiceController::class, 'calculateDistance']);
    Route::get('/nearby-users', [LocationServiceController::class, 'findNearbyUsers']);
});

Route::middleware(['web', 'auth:web'])->prefix('admin-payment-methods')->group(function () {
    Route::get('/default', 'App\Http\Controllers\Customer\AppointmentController@getDefaultAdminPaymentMethod');
});

Route::post('/payment/webhook', [PaymentController::class, 'webhook'])->name('payment.webhook');
