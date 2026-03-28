<?php

use App\Http\Controllers\Api\GeneralController as ApiGeneralController;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\Auth\SocialController;
use App\Http\Controllers\ChatApiController;
use App\Http\Controllers\CustomerApiController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\LikeController;
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

    //Get categories
    Route::get('/categories', [StylistWorkController::class, 'getWorkCategories'])->middleware('throttle:300,1');

    //Public customer routes
    Route::group(['prefix' => '/customer', 'middleware' => ['throttle:300,1', 'optional.auth.sanctum']], function () {
        // get stylist list
        Route::get('stylist/list', [CustomerApiController::class, 'getStylists']);

        // get single stylist
        Route::get('stylist/{stylistId}', [CustomerApiController::class, 'getStylist']);

        // get portfolio list
        Route::get('portfolio/list', [CustomerApiController::class, 'getPortfolios']);

        // get single portfolio
        Route::get('portfolio/{portfolioId}', [CustomerApiController::class, 'getPortfolio']);
    });

    //Login
    Route::post('login', [ApiAuthController::class, 'login']);

    //Google Login
    Route::post('login/google', [SocialController::class, 'handleGoogleLoginFromApi']);

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

        //Toogle like
        Route::post('/like/toggle', [LikeController::class, 'toggle']);

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

            // Get user notifications
            Route::get('/notifications', [ApiAuthController::class, 'getUserNotifications']);

            // Mark notification as read
            Route::post('/notifications/{id}/read', [ApiAuthController::class, 'markNotificationAsRead']);

            // Mark all notification as read
            Route::post('/notifications/read-all', [ApiAuthController::class, 'markAllNotificationsAsRead']);

            // Delete user data
            Route::delete('', [ApiAuthController::class, 'deleteUser']);

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

                    Route::get('{appointmentId}', [StylistAppointmentController::class, 'getSpecificAppointment']);

                    Route::post('{appointmentId}', [StylistAppointmentController::class, 'updateSpecificAppointment']);

                    Route::post('{appointmentId}/dispute', [StylistAppointmentController::class, 'disputeAppointment']);

                    Route::post('{appointmentId}/proof', [StylistAppointmentController::class, 'submitAppointmentWorkProof']);

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

            // Update customer preerences
            Route::patch('/preferences', [CustomerApiController::class, 'updatePreferenceSettings']);

            // Update customer notification settings
            Route::patch('/notification/settings', [CustomerApiController::class, 'updateNotificationSettings']);

            // Update customer billing info
            Route::patch('/billing', [CustomerApiController::class, 'updateBillingInfo']);

            // Customer appointment routes
            Route::group(['prefix' => '/appointment'], function () {
                Route::post('/book', [CustomerApiController::class, 'bookAppointment']);

                Route::get('/list', [CustomerApiController::class, 'getAppointments']);

                Route::get('{appointmentId}', [CustomerApiController::class, 'getAppointment']);

                Route::post('{appointmentId}/review', [CustomerApiController::class, 'submitAppointmentReview']);

                Route::post('{appointmentId}/dispute', [CustomerApiController::class, 'disputeAppointment']);

                Route::patch('{appointmentId}', [CustomerApiController::class, 'updateAppointment']);
            });
        });

        //General route for complete profiles
        Route::group(['middleware' => ['profile.complete', 'email.verified']], function () {
            //Get wallet funding options
            Route::get('/funding-methods', [CustomerApiController::class, 'getFundingMethods']);

            //Authentcated Payment routes
            Route::group(['prefix' => '/payment'], function () {
                //This endpoint is hardcoded in app. SO until updated in the app, do not change the url or method type
                Route::post('/initiate/payfast', [PaymentController::class, 'initiate']);
            });

            //Authentcated wallet routes
            Route::group(['prefix' => '/wallet'], function () {
                Route::get('', [PaymentController::class, 'getUserWallet']);

                Route::get('/transactions', [PaymentController::class, 'getUserTransactions']);

                Route::post('/withdraw', [PaymentController::class, 'withdrawFromWallet']);
            });

            //Authenticated conversation routes
            Route::group(['prefix' => '/conversations'], function () {
                //Get conversations
                Route::get('/', [ChatApiController::class, 'getConversations']);

                //Initiate a conversation
                Route::post('/', [ChatApiController::class, 'startConversation']);

                //Get conversation messages
                Route::get('/{conversationId}/messages', [ChatApiController::class, 'getConversationMessages']);

                //Send a conversation message
                Route::post('/{conversationId}/messages', [ChatApiController::class, 'sendMessage']);

                //Mark chat message as read
                Route::post('/{conversationId}/messages/{messageId}/read', [ChatApiController::class, 'markAsRead']);

                //Send a typing event in a conversation
                Route::post('/{conversationId}', [ChatApiController::class, 'typing']);
            });

            //Authenticated dispute routes
            // Dispute functionality
            Route::group(['prefix' => '/dispute'], function () {
                Route::get('/list', [DisputeController::class, 'index']);

                Route::get('/{disputeId}', [DisputeController::class, 'show']);

                Route::post('/{disputeId}/messages', [DisputeController::class, 'storeMessage']);

                Route::get('/messages/{disputeMessageId}/attachments/{disputeMessageAttachmentIndex}', [DisputeController::class, 'downloadAttachment']);
            });
        });
    });

    //UnAuthenticated Payment routes
    Route::group(['prefix' => '/payment'], function () {
        Route::get('/pay/payfast', [PaymentController::class, 'displayPayfastPage']);

        Route::match(['GET', 'POST'], '/cancel/payfast', [PaymentController::class, 'handleCancelDepositTxn']);

        Route::match(['GET', 'POST'], '/success/payfast', [PaymentController::class, 'handleSuccessfulDepositTxn']);

        Route::post('/webhook/payfast', [PaymentController::class, 'handlePayfastWebhook']);

        Route::post('/webhook/peachpayment', [PaymentController::class, 'handlePeachPaymentPayoutWebhook']);

        Route::match(['GET', 'POST'], '/cancel/peachpayment/checkout', [PaymentController::class, 'handleCancelDepositTxn']);

        Route::match(['GET', 'POST'], '/success/peachpayment/checkout', [PaymentController::class, 'handleSuccessfulDepositTxn']);

        Route::post('/webhook/peachpayment/checkout', [PaymentController::class, 'handlePeachPaymentCheckoutWebhook']);

        // {"amount":"3177.04","card_bin":"420000","card_expiryMonth":"02","card_expiryYear":"2028","card_holder":"Snipfair Test Card","card_last4Digits":"0091","checkoutId":"0564447c519345a29bfe1ed55518778f","currency":"ZAR","customParameters":{"deposit_id":"144","user_id":"39"},"customer_email":"customer@mailinator.com","customer_givenName":"Juliet Schmitt","customer_merchantCustomerId":"39","customer_surname":"Schmitt","id":"8ac7a4a19cbbf601019cbd2732353bf0","merchant_name":"SB Snipfair","merchantTransactionId":"PEACHPAYEMENT-DEPOSIT-144","paymentBrand":"VISA","paymentType":"DB","recon_authCode":"006887","recon_resultCode":"000","recon_rrn":"742005430524","recon_stan":"860002","result_code":"000.100.110","result_description":"Request successfully processed in 'Merchant in Integrator Test Mode'","resultDetails_AcquirerResponse":"E0000","resultDetails_ExtendedDescription":"Transaction Successful","signature":"2accbdf4c102a720c9f9ffdb4a0856235dfc7758d5d675d0d1cea9130d081186","timestamp":"2026-03-05T08:39:55Z"}

        // {"amount":"3177.04","checkoutId":"0564447c519345a29bfe1ed55518778f","currency":"ZAR","customParameters":{"deposit_id":"144","user_id":"39"},"merchant_name":"SB Snipfair","merchantTransactionId":"PEACHPAYEMENT-DEPOSIT-144","paymentType":"DB","result_code":"000.200.100","result_description":"successfully created checkout","signature":"e069680cc28a5d2657eb54be2030de6e27abcd21cac4a0abbf6045ea5c97431e","timestamp":"2026-03-05T08:15:16Z"}
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
    // Update user data
    Route::post('/user/update', [ApiAuthController::class, 'updateUser']);
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

Route::post('/payment/webhook', [PaymentController::class, 'handlePayfastWebhook'])->name('payment.webhook');
