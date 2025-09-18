<?php

use App\Http\Controllers\Admin\{AuthenticationController, DashboardController, AdministrationController, TransactionController, ContentController, SettingsController, SupportController, TicketController};
use App\Http\Controllers\SEOController;
use App\Http\Middleware\{AdminAuthenticate, AdminRole};
use App\Models\AdminPaymentMethod;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AuthenticationController::class, 'showLoginForm'])->name('login');
    Route::post('login', [AuthenticationController::class, 'login']);
    Route::post('logout', [AuthenticationController::class, 'logout'])->name('logout');
});

Route::prefix('admin')->name('admin.')->middleware(AdminAuthenticate::class)->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin-dashboard');

    Route::get('profile', [AuthenticationController::class, 'showProfile'])->name('profile.show');
    Route::put('profile', [AdministrationController::class, 'updateProfile'])->name('profile.update');

    Route::post('payout-requests/{id}/approve', [TransactionController::class, 'approveWithdrawal'])->name('payouts.approve');
    Route::post('payout-requests/{id}/reject', [TransactionController::class, 'rejectWithdrawal'])->name('payouts.reject');

    Route::post('deposit-requests/{id}/approve', [TransactionController::class, 'approveDeposit'])->name('deposits.approve');
    Route::post('deposit-requests/{id}/reject', [TransactionController::class, 'rejectDeposit'])->name('deposits.reject');

    Route::get('profile', function () { return redirect()->route('admin.admins.index'); })->name('profile');
    Route::middleware([AdminRole::class . ':super-admin,moderator'])->group(function () {
        Route::get('admins', [AdministrationController::class, 'index'])->name('admins.index');
        Route::delete('admins/{admin}', [AdministrationController::class, 'destroy'])->name('admins.destroy');
        Route::put('admins/{admin}/toggle-status', [AdministrationController::class, 'toggleStatus'])->name('admins.toggle-status');
        Route::post('admins/send-message', [AdministrationController::class, 'sendMessage'])->name('admins.send-message');
    });

    Route::middleware([AdminRole::class . ':super-admin'])->group(function () {
        Route::post('admins/invite', [AdministrationController::class, 'invite'])->name('admins.invite');
        Route::put('admins/{admin}/role', [AdministrationController::class, 'updateRole'])->name('admins.update-role');
        Route::post('admins/{admin}/reset-password', [AdministrationController::class, 'resetPassword'])->name('admins.reset-password');
        Route::get('system-settings', function () {
            return view('admin.system-settings');
        })->name('system.settings');
    });

    Route::middleware([AdminRole::class . ':super-admin,support-admin'])->group(function () {
        Route::get('support-tickets', function () {
            return view('admin.support.tickets');
        })->name('support.tickets');
    });

    Route::middleware([AdminRole::class . ':super-admin,moderator'])->group(function () {
        Route::get('content-moderation', function () {
            return view('admin.moderation.content');
        })->name('moderation.content');
    });

    Route::get('users', [DashboardController::class, 'users'])->name('users');
    Route::get('stylist/{id}', [DashboardController::class, 'getStylist'])->name('users.stylist');
    Route::get('customer/{id}', [DashboardController::class, 'getCustomer'])->name('users.customer');
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions');

    Route::post('transactions/update-status', [TransactionController::class, 'updateTransactionStatus'])->name('transactions.update-status');
    Route::post('transactions/update-subscription-status', [TransactionController::class, 'updateSubscriptionStatus'])->name('transactions.update-subscription-status');
    Route::post('transactions/flag-appointment', [TransactionController::class, 'flagAppointment'])->name('transactions.flag-appointment');
    Route::post('transactions/delete-appointment', [TransactionController::class, 'deleteAppointment'])->name('transactions.delete-appointment');
    Route::post('transactions/flag-transaction', [TransactionController::class, 'flagTransaction'])->name('transactions.flag-transaction');
    Route::post('transactions/delete-transaction', [TransactionController::class, 'deleteTransaction'])->name('transactions.delete-transaction');
    Route::post('transactions/flag-subscription', [TransactionController::class, 'flagSubscription'])->name('transactions.flag-subscription');
    Route::post('transactions/delete-subscription', [TransactionController::class, 'deleteSubscription'])->name('transactions.delete-subscription');

    Route::post('users/disable', [DashboardController::class, 'disableUser'])->name('users.disable');
    Route::post('users/enable', [DashboardController::class, 'enableUser'])->name('users.enable');
    Route::delete('users/{user}', [DashboardController::class, 'destroyUser'])->name('users.destroy');
    Route::post('users/{user}/restore', [DashboardController::class, 'restoreUser'])->name('users.restore');
    Route::post('users/{user}/delete', [DashboardController::class, 'forceDeleteUser'])->name('users.delete');

    Route::post('stylists/disable', [DashboardController::class, 'disableStylist'])->name('stylists.disable');
    Route::post('stylists/enable', [DashboardController::class, 'enableStylist'])->name('stylists.enable');
    Route::post('stylists/flag', [DashboardController::class, 'flagStylist'])->name('stylists.flag');
    Route::post('stylists/unflag', [DashboardController::class, 'unflagStylist'])->name('stylists.unflag');
    Route::delete('stylists/{user}', [DashboardController::class, 'destroyStylist'])->name('stylists.destroy');

    Route::post('stylists/approve', [DashboardController::class, 'approveStylist'])->name('stylists.approve');
    Route::post('stylists/reject', [DashboardController::class, 'rejectStylist'])->name('stylists.reject');

    Route::get('contents', [ContentController::class, 'index'])->name('contents');

    Route::delete('contents/reviews/{review}', [ContentController::class, 'deleteReview'])->name('contents.reviews.delete');
    Route::patch('contents/stylists/{user}/toggle-featured', [ContentController::class, 'toggleStylistFeatured'])->name('contents.stylists.toggle-featured');
    Route::post('contents/faqs', [ContentController::class, 'storeFaq'])->name('contents.faqs.store');
    Route::patch('contents/faqs/{faq}', [ContentController::class, 'updateFaq'])->name('contents.faqs.update');
    Route::delete('contents/faqs/{faq}', [ContentController::class, 'deleteFaq'])->name('contents.faqs.delete');
    Route::post('contents/media', [ContentController::class, 'uploadFeaturedMedia'])->name('contents.media.upload');
    Route::delete('contents/media', [ContentController::class, 'deleteFeaturedMedia'])->name('contents.media.delete');
    Route::post('contents/styles-media', [ContentController::class, 'uploadStylesMedia'])->name('contents.styles_media.upload');
    Route::post('contents/styles-media-add', [ContentController::class, 'addStylesMedia'])->name('contents.styles_media.add');
    Route::delete('contents/styles-media', [ContentController::class, 'deleteStylesMedia'])->name('contents.styles_media.delete');

    Route::get('support', [TicketController::class, 'index'])->name('support');

    Route::prefix('disputes')->name('disputes.')->controller(App\Http\Controllers\Admin\AdminDisputeController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('{dispute}', 'show')->name('show');
        Route::patch('{dispute}/status', 'updateStatus')->name('status.update');
        Route::patch('{dispute}/priority', 'updatePriority')->name('priority.update');
        Route::post('{dispute}/messages', 'storeMessage')->name('messages.store');
    });

    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::get('/', [TicketController::class, 'index'])->name('index');
        Route::get('stats', [TicketController::class, 'getStats'])->name('tickets.stats');
        Route::get('{ticket}', [TicketController::class, 'show'])->name('show');
        Route::get('{ticket}/messages', [TicketController::class, 'getMessages'])->name('messages');
        Route::patch('{ticket}/update', [TicketController::class, 'updateStatus'])->name('update');
        Route::patch('{ticket}/status', [TicketController::class, 'updateStatus'])->name('update-status');
        Route::patch('{ticket}/priority', [TicketController::class, 'updatePriority'])->name('update-priority');
        Route::patch('{ticket}/assign', [TicketController::class, 'assignTicket'])->name('assign');
        Route::post('{ticket}/messages', [TicketController::class, 'sendMessage'])->name('send-message');
    });

    Route::get('notifications', [ContentController::class, 'notifications'])->name('notifications');
    Route::get('/notifications/{id}', [ContentController::class, 'notificationShow'])->name('notifications.show');
    Route::patch('/notifications/{id}/read', [ContentController::class, 'markNotificationAsRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [ContentController::class, 'markAllNotificationsAsRead'])->name('notifications.read-all');
    Route::get('settings', [SettingsController::class, 'index'])->name('settings');
    Route::put('settings/update', [SettingsController::class, 'update'])->name('settings.updateAdminConfig');
    Route::put('settings/update', [SettingsController::class, 'update'])->name('settings.updateAdminConfig');
    Route::post('settings/calculate-statistics', [SettingsController::class, 'calculateStatistics'])->name('settings.calculate-statistics');
    Route::post('settings/update-policy', [SettingsController::class, 'updatePolicy'])->name('settings.update-policy');
    Route::put('settings/update-password', [SettingsController::class, 'updatePassword'])->name('settings.update-password');
    Route::get('settings/theme', [DashboardController::class, 'index'])->name('settings.theme');

    Route::prefix('payment-methods')->name('payment-methods.')->controller(SupportController::class)->group(function () {
        Route::put('/{paymentMethod}/toggle-active', 'paymentToggleActive')->name('toggle-active');
        Route::put('/{paymentMethod}/toggle-default', 'paymentToggleDefault')->name('toggle-default');
        Route::post('/', 'paymentStore')->name('store');
        Route::put('/{paymentMethod}', 'paymentUpdate')->name('update');
        Route::delete('/{paymentMethod}', 'paymentDestroy')->name('destroy');
    });

    Route::prefix('plans')->name('plans.')->controller(SupportController::class)->group(function () {
        Route::put('/{plan}/toggle', 'planToggle')->name('toggle');
        Route::post('/', 'planStore')->name('store');
        Route::put('/{plan}', 'planUpdate')->name('update');
        Route::delete('/{plan}', 'planDestroy')->name('destroy');
    });

    Route::prefix('categories')->name('categories.')->controller(SupportController::class)->group(function () {
        Route::put('/{category}/toggle', 'categoryToggle')->name('toggle');
        Route::post('/', 'categoryStore')->name('store');
        Route::post('/{category}', 'categoryUpdate')->name('update');
        Route::delete('/{category}', 'categoryDestroy')->name('destroy');
    });

    Route::prefix('seo')->name('seo.')->group(function () {
        Route::post('regenerate-sitemap', [SEOController::class, 'regenerateSitemap'])->name('regenerate-sitemap');
    });
});
