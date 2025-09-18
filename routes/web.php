<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\Customer\TicketController as CustomerTicketController;
use App\Http\Controllers\Customer\WalletController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SEOController;
use App\Http\Controllers\Stylist\AppointmentController;
use App\Http\Controllers\Stylist\DashboardController;
use App\Http\Controllers\Stylist\SubscriptionController;
use App\Http\Controllers\Stylist\WorkController;
use App\Http\Controllers\StylistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;

// SEO Routes
Route::get('/sitemap.xml', [SEOController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SEOController::class, 'robots'])->name('robots');

Route::get('/', [HomeController::class, 'home'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/services', [HomeController::class, 'services'])->name('services');
Route::get('/explore', [HomeController::class, 'explore'])->name('explore');
Route::get('/contact-us', function () { return Inertia::render('Landing/ContactPage'); })->name('contact');
Route::get('/faqs', [HomeController::class, 'faqs'])->name('faqs');
Route::get('/terms', [HomeController::class, 'terms'])->name('terms');
Route::get('/privacy-policy', [HomeController::class, 'privacyPolicy'])->name('privacy-policy');
Route::get('/cookies', [HomeController::class, 'cookies'])->name('cookies');
Route::post('/send-message', [LandingController::class, 'sendMessage'])->name('contact.send');

// Test routes for Pusher debugging (remove in production)
Route::get('/test-pusher', function () {
    try {
        // Test basic Pusher connection
        $pusher = app('pusher');

        // Send a test event
        $pusher->trigger('test-channel', 'test-event', [
            'message' => 'Hello from Pusher!',
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Test event sent to Pusher',
            'config' => [
                'app_id' => config('broadcasting.connections.pusher.app_id'),
                'key' => config('broadcasting.connections.pusher.key'),
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'config_check' => [
                'app_id' => config('broadcasting.connections.pusher.app_id') ? 'SET' : 'MISSING',
                'key' => config('broadcasting.connections.pusher.key') ? 'SET' : 'MISSING',
                'secret' => config('broadcasting.connections.pusher.secret') ? 'SET' : 'MISSING',
                'cluster' => config('broadcasting.connections.pusher.options.cluster') ? 'SET' : 'MISSING',
            ]
        ], 500);
    }
});

Route::middleware('auth')->post('/test-chat-broadcast', function (Illuminate\Http\Request $request) {
    try {
        $user = $request->user();

        // Broadcast using Laravel's event system
        event(new App\Events\MessageSent(
            new App\Models\Message([
                'id' => 'test_' . time(),
                'text' => 'Test broadcast message from ' . $user->name,
                'is_read' => false,
                'sender_id' => $user->id,
                'receiver_id' => $user->id,
                'created_at' => now(),
            ]),
            new App\Models\Conversation([
                'id' => 'test_conversation',
                'initiator_id' => $user->id,
                'recipient_id' => $user->id,
            ])
        ));

        return response()->json([
            'success' => true,
            'message' => 'Test chat message broadcasted',
            'user_id' => $user->id
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::group(['middleware' => ['auth', 'verified']], function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();
        if($user->role === 'customer')
            return redirect()->route('customer.explore');
        else if($user->role === 'stylist')
            return redirect()->route('stylist.dashboard');
    })->name('dashboard');

    Route::group(['prefix' => 'customer', 'middleware' => 'is.customer', 'as' => 'customer.', 'controller' => CustomerController::class], function () {
        Route::get('/explore', 'explore')->name('explore');
        Route::get('/stylists', 'getStylists')->name('stylists');
        Route::get('/stylist/{id}', 'getStylist')->name('stylists.show');
        Route::get('/appointment/book/{id}', 'bookAppointment')->name('appointment.book');
        Route::get('/appointment/{id}', 'getAppointment')->name('appointment.show');
        Route::get('/appointments', 'myAppointments')->name('appointments');
        Route::post('/appointment/review/{id}', 'submitReview')->name('appointment.review');
        Route::post('/appointment/dispute/{id}', 'disputeAppointment')->name('appointment.dispute');
        Route::get('/rewards', [RewardController::class, 'index'])->name('rewards');
        Route::post('/rewards/redeem', [RewardController::class, 'redeemPromoCode'])->name('rewards.redeem');
        Route::post('/rewards/use', [RewardController::class, 'useReward'])->name('rewards.use');

        // Wallet routes
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
        Route::get('/wallet/transactions', [WalletController::class, 'getTransactions'])->name('wallet.transactions');
        Route::post('/wallet-topup', [WalletController::class, 'topup'])->name('wallet.topup');
        Route::post('/process-booking-payment', [App\Http\Controllers\Customer\AppointmentController::class, 'processBookingPayment'])->name('process-booking-payment');

        Route::get('/profile', 'profile')->name('profile');
        Route::put('/profile', 'profileUpdate')->name('profile.update');
        Route::post('/profile/avatar', 'avatarUpdate')->name('profile.avatar.update');
        Route::get('/settings', 'settings')->name('settings');
        Route::patch('/settings/preferences', 'updatePreferences')->name('preferences.update');
        Route::patch('/settings/notifications', 'updateNotifications')->name('notifications.update');

        // Settings routes
        Route::patch('/settings/billing', 'updateBillingInfo')->name('settings.billing');
        Route::post('/settings/payment-methods', 'storePaymentMethod')->name('settings.payment-methods.store');
        Route::delete('/settings/payment-methods/{id}', 'deletePaymentMethod')->name('settings.payment-methods.destroy');
        Route::patch('/settings/payment-methods/{id}/set-default', 'setDefaultPaymentMethod')->name('settings.payment-methods.set-default');

        Route::get('/favorites', 'getFavorites')->name('favorites');
        Route::get('/settings/theme', function() { return Inertia::render('Customer/Dashboard'); })->name('settings.theme');
        Route::get('/referral', function() { return Inertia::render('Customer/Dashboard'); })->name('referral');
        Route::get('/chat', [ChatController::class, 'index'])->name('chat');
        Route::get('/notifications', [LikeController::class, 'notifications'])->name('notifications');

        // Customer payments routes
        Route::post('/payment/initiate', [PaymentController::class, 'initiate'])->name('payment.initiate');
        Route::post('/payment/cancel', [PaymentController::class, 'cancelDeposit'])->name('payment.cancel');
    });

    // Chat functionality
    Route::middleware('auth')->group(function () {
        Route::post('/chat/send', [ChatController::class, 'sendMessage'])->name('chat.send');
        Route::post('/chat/start', [ChatController::class, 'startConversation'])->name('chat.start');
        Route::patch('/chat/read', [ChatController::class, 'markAsRead'])->name('chat.read');
        Route::post('/chat/typing', [ChatController::class, 'typing'])->name('chat.typing');
    });

    // Dispute functionality
    Route::middleware('auth')->group(function () {
        Route::get('/disputes', [App\Http\Controllers\DisputeController::class, 'index'])->name('disputes.index');
        Route::get('/disputes/{dispute}', [App\Http\Controllers\DisputeController::class, 'show'])->name('disputes.show');
        Route::post('/disputes/{dispute}/messages', [App\Http\Controllers\DisputeController::class, 'storeMessage'])->name('disputes.messages.store');
        Route::get('/disputes/messages/{message}/attachments/{index}', [App\Http\Controllers\DisputeController::class, 'downloadAttachment'])->name('disputes.messages.download');
    });

    // Like functionality
    Route::post('/like/toggle', [LikeController::class, 'toggle'])->name('like.toggle');
    Route::patch('/notifications/{id}/read', [LikeController::class, 'markNotificationAsRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [LikeController::class, 'markAllNotificationsAsRead'])->name('notifications.read-all');

    Route::group(['prefix' => 'stylist', 'middleware' => ['profile.complete', 'is.stylist'], 'as' => 'stylist.', 'controller' => StylistController::class], function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/schedules', [AppointmentController::class, 'fullSchedules'])->name('schedules');
        Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments');
        Route::get('/appointment/{id}', [AppointmentController::class, 'appointment'])->name('appointment'); //stylist.appointment.update
        Route::post('/appointment/{id}/update', [AppointmentController::class, 'update'])->name('appointment.update');
        Route::post('/appointment/{id}/forms', [AppointmentController::class, 'forms'])->name('appointment.forms');
        Route::get('/availability', [AppointmentController::class, 'getSchedules'])->name('appointments.availability');
        Route::post('/availability', [AppointmentController::class, 'updateSchedules'])->name('appointments.availability.save');
        Route::post('/availability/location', [AppointmentController::class, 'updateLocation'])->name('appointments.location.update');
        Route::get('/calendar', [AppointmentController::class, 'getCalendar'])->name('appointments.calendar');
        //stylist.profile middleware

        Route::get('/work', [WorkController::class, 'work'])->name('work');
        Route::get('/work/create', [WorkController::class, 'create'])->name('work.create');
        Route::get('/work/{id}/edit', 'editWork')->name('work.edit');
        Route::post('/work/save', 'saveWork')->name('work.save');
        Route::put('/work/{id}/update', 'updateWork')->name('work.update');
        Route::put('/work/{id}/toggle', 'toggleWork')->name('work.toggle');
        Route::post('/work/{work}/media', 'uploadWorkMedia')->name('work.media.upload');
        Route::delete('/work/{work}/media', 'deleteWorkMedia')->name('work.media.delete');
        Route::delete('/work/{work}/delete', 'deleteWork')->name('work.delete');
        Route::get('/work/requests', function() { return Inertia::render('Stylist/Work/Requests'); })->name('work.requests');

        Route::get('/portfolio', [WorkController::class, 'portfolio'])->name('portfolio');
        Route::get('/earnings', [DashboardController::class, 'earningIndex'])->name('earnings');
        Route::get('/earnings/methods', [DashboardController::class, 'earningMethods'])->name('earnings.methods');
        Route::get('/account/settings', [DashboardController::class, 'accountSettings'])->name('account.settings');
        Route::get('/earnings/settings', [DashboardController::class, 'earningSettings'])->name('earnings.settings');
        Route::put('/earnings/settings/save', [DashboardController::class, 'earningsSettingsUpdate'])->name('earnings.settings.update');
        Route::post('/earnings/methods/create', [DashboardController::class, 'earningsMethodsCreate'])->name('earnings.methods.create');;
        Route::post('/earnings/methods/{id}/update', [DashboardController::class, 'earningsMethodsUpdate'])->name('earnings.methods.update');;
        Route::post('/earnings/methods/{id}/default', [DashboardController::class, 'earningsMethodsSetDefault'])->name('earnings.methods.default');;
        Route::post('/earnings/methods/{id}/toggle', [DashboardController::class, 'earningsMethodsToggle'])->name('earnings.methods.toggle');
        Route::delete('/earnings/methods/{id}/delete', [DashboardController::class, 'earningsMethodsDestroy'])->name('earnings.methods.delete');
        Route::post('/withdrawal/request', [DashboardController::class, 'withdrawalRequest'])->name('withdrawal.request');

        // Subscription routes
        Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions');
        Route::get('/verification', [SubscriptionController::class, 'getVerification'])->name('verification');

        Route::get('/tutorials', function() { return Inertia::render('Stylist/Tutorials/Index'); })->name('tutorials');
        Route::get('/tutorials/all', function() { return Inertia::render('Stylist/Tutorials/Tutorials'); })->name('tutorials.all');

        Route::get('/profile', 'profile')->name('profile');
        Route::get('/profile/services', 'serviceList')->name('profile.services');
        Route::put('/profile', 'profileUpdate')->name('profile.update');
        Route::post('/profile/avatar', 'avatarUpdate')->name('profile.avatar.update');
        Route::post('/profile/banner', 'bannerUpdate')->name('profile.banner.update');
        Route::post('/profile/verification', 'verificationUpdate')->name('profile.verification.update');
        Route::post('/profile/certificate', 'certificationCreate')->name('profile.certificate.create');
        Route::get('/settings', function() { return redirect()->route('stylist.account.settings'); })->name('settings');
        Route::get('/favorites', function() { return Inertia::render('Customer/Favorites'); })->name('favorites');
        Route::get('/settings/theme', function() { return Inertia::render('Customer/Dashboard'); })->name('settings.theme');
        Route::get('/referral', function() { return Inertia::render('Customer/Dashboard'); })->name('referral');
        Route::get('/chat', [ChatController::class, 'index'])->name('chat');
        Route::get('/notifications', [LikeController::class, 'notifications'])->name('notifications');
        Route::get('/customer/{id}', [CustomerController::class, 'getCustomer'])->name('customer.show');
    });
    Route::get('/user-notification/{id}', [LikeController::class, 'userNotification'])->name('user.notifications.show');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Customer support ticket routes
    Route::prefix('support')->name('tickets.')->group(function () {
        Route::get('/', [CustomerTicketController::class, 'index'])->name('index');
        Route::get('/create', [CustomerTicketController::class, 'create'])->name('create');
        Route::post('/', [CustomerTicketController::class, 'store'])->name('store');
        Route::get('{ticket}', [CustomerTicketController::class, 'show'])->name('show');
        Route::post('{ticket}/messages', [CustomerTicketController::class, 'sendMessage'])->name('send-message');
    });
    Route::get('/link/{link}', [HomeController::class, 'linkRedirect'])->name('link.redirect');
    Route::get('/stylist-public/{id}', [HomeController::class, 'showStylist'])->name('link.show');
});

// ===========================================================================================

// Route::get('/guides', function(){ return Inertia::render('Guides'); });

require __DIR__.'/auth.php';
