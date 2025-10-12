<?php

use App\Http\Controllers\Api\GeneralController as ApiGeneralController;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\CustomerApiController;
use App\Http\Controllers\LocationServiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StylistController;
use App\Http\Controllers\Stylist\{
    DashboardController as StylistDashboardController,
    AppointmentController as StylistAppointmentController,
    WorkController as StylistWorkController
};
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

// Mobile App API Routes Start
Route::middleware('api')->group(function () {
    //Get platform config
    Route::get('platform-settings', [ApiGeneralController::class, 'getPlatformSettings'])->middleware(['throttle:1,1']);

    //Login
    Route::post('login', [ApiAuthController::class, 'login']);

    //Register Customer
    Route::post('register/customer', [ApiAuthController::class, 'registerCustomer']);

    //Register stylists
    Route::post('register/stylist', [ApiAuthController::class, 'registerStylist']);

    //Forgot password
    Route::post('forgot-password', [ApiAuthController::class, 'forgotPassword']);

    //Ensure authenticated
    Route::middleware('auth:sanctum')->group(function () {
        //Get Bank List
        Route::get('banks', [PaymentController::class, 'bankList']);

        //Authenticated user routes
        Route::prefix('/user')->group(function () {
            //Get user profile
            Route::get('', [ApiAuthController::class, 'getUserFromRequest']);

            //Logout user
            Route::post('/logout', action: [ApiAuthController::class, 'logout']);

            //Verify email otp
            Route::post('/verify-email-otp', [ApiAuthController::class, 'verifyUserEmailFromOtp'])
                ->middleware(['throttle:6,1']);

            //Resend email otp
            Route::post('/resend-email-otp', [ApiAuthController::class, 'resendVerificationOtp'])
                ->middleware(['throttle:6,1']);

            //Update user password
            Route::patch('password', [ApiAuthController::class, 'updatePassword'])
                ->middleware('profile.complete');

            // Update user data
            Route::patch('', [ApiAuthController::class, 'updateUser']);

            Route::group(['prefix' => '/location'], function () {
                //update location consent status
                Route::post('/consent', [LocationServiceController::class, 'recordLocationConsent']);

                //get location consent status
                Route::get('/consent', [LocationServiceController::class, 'getLocationConsentStatus']);

                //Update user location
                Route::patch('', [LocationServiceController::class, 'updateLocation']);

                //Update user location based on requester IP address
                Route::post('/update-by-ip-address', [LocationServiceController::class, 'updateIPLocation']);

                //calculate location distance between authticated user and another user (possibly a stylist)
                Route::post('/distance/{user}', [LocationServiceController::class, 'calculateDistance']);

                //get nearby users possibly stylists
                Route::get('/nearby-users', [LocationServiceController::class, 'findNearbyUsers']);
            });
        });

        //Stylist routes
        Route::group(['prefix' => '/stylist', 'middleware' => ['is.stylist', 'email.verified']], function () {
            // Get stylist profile data
            Route::get('/profile', [StylistController::class, 'profile']);

            //Update skill
            Route::patch('basic/profile', [StylistController::class, 'completeSkill']);

            //Update Identification documents
            Route::patch('/identity', [StylistController::class, 'completeIdentity']);

            //Update profile avatar
            Route::post('/profile/avatar', [StylistController::class, 'avatarUpdate']);

            //Update profile banner
            Route::post('/profile/banner', [StylistController::class, 'bannerUpdate']);

            //Complete stylist profile routes
            Route::group(['middleware' => 'profile.complete'], function () {
                // Update stylist profile data
                Route::patch('/profile', [StylistController::class, 'updateProfile']);

                // Get stylist payment methods data
                Route::get('/payment-methods', [StylistDashboardController::class, 'earningMethods']);

                // create stylist payment methods data
                Route::post('/payment-methods', [StylistDashboardController::class, 'earningsMethodsCreate']);

                // update specific stylist payment methods data
                Route::patch('/payment-methods/{id}', [StylistDashboardController::class, 'earningsMethodsUpdate']);

                // Make  stylist payment method default
                Route::post('/payment-methods/{id}/default', [StylistDashboardController::class, 'earningsMethodsSetDefault']);

                // Activate or Deactivate stylist payment method
                Route::post('/payment-methods/{id}/toggle', [StylistDashboardController::class, 'earningsMethodsToggle']);

                // Delete stylist payment method
                Route::delete('/payment-methods/{id}', [StylistDashboardController::class, 'earningsMethodsDestroy']);

                // Get stylist earnings
                Route::get('/earnings', [StylistDashboardController::class, 'earningIndex']);

                // Get stylist settings
                Route::get('/settings', [StylistDashboardController::class, 'earningSettings']);

                // Update stylist settings
                Route::put('/settings', [StylistDashboardController::class, 'earningsSettingsUpdate']);

                //Get stylist portfolio stats
                Route::get('/stats', [StylistController::class, 'getCurrentStylistStats']);

                //Stylist work routes
                Route::group((['prefix' => '/work']), function () {
                    Route::get('/categories', [StylistWorkController::class, 'getWorkCategories']);

                    Route::get('/list', [StylistWorkController::class, 'getWorkList']);

                    Route::post('/', [StylistWorkController::class, 'createWork']);

                    Route::get('{id}', [StylistWorkController::class, 'getWork']);

                    Route::post('{id}', [StylistWorkController::class, 'updateWork']);

                    Route::put('{id}/status', [StylistWorkController::class, 'updateWorkStatus']);

                    Route::delete('{id}', [StylistWorkController::class, 'deleteWork']);
                });

                //Stylist appointment routes
                Route::group((['prefix' => '/appointment']), function () {

                    Route::post('/availability', [StylistAppointmentController::class, 'updateAppointmentAvailability']);

                    Route::get('/availability', [StylistAppointmentController::class, 'getAppointmentAvailability']);

                    Route::get('/list', [StylistAppointmentController::class, 'getAppointmentList']);

                    Route::get('{id}', [StylistAppointmentController::class, 'getSpecificAppointment']);

                    Route::post('{id}', [StylistAppointmentController::class, 'updateSpecificAppointment']);

                    //Comment start here
                    // Route::get('/pending-appointments', 'App\Http\Controllers\Stylist\AppointmentController@getPendingAppointments');
                    // Route::post('/approve-appointment', 'App\Http\Controllers\Stylist\AppointmentController@approveAppointment');
                    // Route::post('/confirm-meetup', 'App\Http\Controllers\Stylist\AppointmentController@confirmMeetup');
                    // Route::post('/complete-appointment', 'App\Http\Controllers\Stylist\AppointmentController@completeAppointment');
                    // Route::post('/process-subscription-payment', 'App\Http\Controllers\Stylist\SubscriptionController@processSubscriptionPayment');
                    // Route::post('/update-availability', 'App\Http\Controllers\Stylist\SubscriptionController@updateAvailability');
                    // Route::get('/appointment-status/{appointmentId}', 'App\Http\Controllers\Stylist\AppointmentController@getAppointment');
                    // Route::post('/update-appointment', 'App\Http\Controllers\Stylist\AppointmentController@updateAppointment');
                });


                //Here...
            });
        });

        //Customer routes
        Route::group(['prefix' => '/customer', 'middleware' => ['is.customer', 'email.verified']], function () {
            //Get customer stats
            Route::get('/stats', [CustomerApiController::class, 'getStats']);

            // Update customer profile data
            Route::patch('profile', [CustomerApiController::class, 'profileUpdate']);

            // get customer profile data
            Route::get('profile', [CustomerApiController::class, 'getProfile']);

            // get stylist list
            Route::get('stylist/list', [CustomerApiController::class, 'getStylists']);

            // get single stylist
            Route::get('stylist/{stylistId}', [CustomerApiController::class, 'getStylist']);

            // get portfolio list
            Route::get('portfolio/list', [CustomerApiController::class, 'getPortfolios']);

            // get single portfolio
            Route::get('portfolio/{portfolioId}', [CustomerApiController::class, 'getPortfolio']);
        });
    });
});
// Mobile App API Routes End


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
