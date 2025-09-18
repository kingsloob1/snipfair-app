<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\AdminNotificationHelper;
use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\FAQ;
use App\Models\User;
use App\Models\Appointment;
use App\Models\AppointmentProof;
use App\Models\Portfolio;
use App\Models\StylesMedia;
use App\Models\Transaction;
use App\Models\WebsiteConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ContentController extends Controller
{
    public function index()
    {
        $admin = Auth::guard('admin')->user();
        // Get reviews with appointment and user details
        $reviews = Review::with(['appointment.customer', 'appointment.stylist'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'appointment' => [
                        'customer' => $review->appointment->customer->name ?? 'Unknown Customer',
                        'stylist' => $review->appointment->stylist->name ?? 'Unknown Stylist',
                    ],
                    'created_at' => $review->created_at->format('M d, Y'),
                ];
            });

        // Get FAQs
        $faqs = FAQ::orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($faq) {
                return [
                    'id' => $faq->id,
                    'question' => $faq->question,
                    'answer' => $faq->answer,
                    'category' => $faq->category,
                    'created_at' => $faq->created_at->format('M d, Y'),
                ];
            });

        // Get stylists with their stats for featured section
        $stylists_for_featured = User::where('role', 'stylist')
            ->with(['portfolios'])
            ->withCount(['stylistAppointments', 'portfolios', 'receivedReviews'])
            ->withAvg('receivedReviews', 'rating')
            ->withSum(['stylistEarnings' => function ($query) {
                $query->where('status', 'completed')->where('type', 'earning');
            }], 'amount')
            ->orderBy('is_featured', 'desc')
            ->orderBy('received_reviews_avg_rating', 'desc')
            ->get()
            ->map(function ($stylist) {
                return [
                    'id' => $stylist->id,
                    'name' => $stylist->name,
                    'email' => $stylist->email,
                    'avatar' => getAvatar($stylist),
                    'total_appointments' => $stylist->stylist_appointments_count ?? 0,
                    'total_earnings' => (float) $stylist->stylist_earnings_sum_amount ?? 0,
                    'average_rating' => round($stylist->received_reviews_avg_rating ?? 0, 1),
                    'portfolios_count' => $stylist->portfolios_count ?? 0,
                    'total_reviews' => $stylist->received_reviews_count ?? 0,
                    'is_featured' => $stylist->is_featured ?? false,
                ];
            });

        $featured_media = getAdminConfig('featured_media') ?? [];
        $portfolios = Portfolio::where('is_available', true)->whereJsonLength('media_urls', '>', 0)->get();
        $allPortfolioImages = $portfolios->flatMap(function ($portfolio) {
            if (empty($portfolio->media_urls)) return [];
            return collect($portfolio->media_urls)->map(function ($image, $index) use ($portfolio) {
                return [
                    'id' => $portfolio->id,
                    'slug' => $portfolio->id . '_' . $index,
                    'type' => 'portfolio',
                    'image' => $image,
                ];
            });
        });

        $appointment_proofs = AppointmentProof::with('appointment.portfolio')
            ->whereHas('appointment', function ($query) {
                $query->where('status', 'completed');
            })->whereHas('appointment.portfolio', function ($query) {
                $query->where('is_available', true);
            })->whereJsonLength('media_urls', '>', 0)
            ->get();

        $allProofImages = $appointment_proofs->flatMap(function ($proof) {
            if (empty($proof->media_urls)) return [];
            return collect($proof->media_urls)->map(function ($image, $index) use ($proof) {
                return [
                    'id' => $proof->appointment->portfolio->id,
                    'slug' => $proof->appointment->portfolio->id . '_' . $index,
                    'type' => 'proof',
                    'image' => $image,
                ];
            });
        });

        $styles_media = StylesMedia::all()->groupBy('type'); // dd($styles_media, $allProofImages, $allPortfolioImages);

        return Inertia::render('Admin/Account/Contents/Index', [
            'auth' => $admin,
            'reviews' => $reviews,
            'faqs' => $faqs,
            'stylists_for_featured' => $stylists_for_featured,
            'featured_media' => $featured_media,
            'styles_images' => $styles_media['styles'] ?? collect(),
            'media_images' => $styles_media['media'] ?? collect(),
            'portfolios' => $allPortfolioImages,
            'proofs' => $allProofImages,
            'all_images' => $allPortfolioImages->merge($allProofImages)->values(),
        ]);
    }

    public function deleteReview(Review $review)
    {
        $review->delete();

        return redirect()->back()->with('success', 'Review deleted successfully.');
    }

    public function toggleStylistFeatured(User $user)
    {
        if ($user->role !== 'stylist') {
            return redirect()->back()->with('error', 'User is not a stylist.');
        }

        $user->update([
            'is_featured' => !$user->is_featured
        ]);

        $status = $user->is_featured ? 'featured' : 'unfeatured';

        return redirect()->back()->with('success', "Stylist {$status} successfully.");
    }

    public function storeFaq(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'category' => 'required|string|max:100',
        ]);

        FAQ::create($request->only(['question', 'answer', 'category']));

        return redirect()->back()->with('success', 'FAQ created successfully.');
    }

    public function updateFaq(Request $request, FAQ $faq)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'category' => 'required|string|max:100',
        ]);

        $faq->update($request->only(['question', 'answer', 'category']));

        return redirect()->back()->with('success', 'FAQ updated successfully.');
    }

    public function deleteFaq(FAQ $faq)
    {
        $faq->delete();

        return redirect()->back()->with('success', 'FAQ deleted successfully.');
    }

    public function notifications(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        $notifications = $admin->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type ?? 'update',
                    'title' => $notification->title,
                    'description' => $notification->description,
                    'time_ago' => $notification->created_at->diffForHumans(),
                    'time_string' => $notification->created_at->format('F j, Y \a\t g:i A'),
                    'priority' => AdminNotificationHelper::formatPriority($notification->priority),
                    'is_read' => $notification->is_seen,
                ];
            });

        return Inertia::render('Admin/Account/Notifications', [
            'auth' => $admin,
            'notifications' => $notifications,
        ]);
    }

    public function uploadFeaturedMedia(Request $request)
    {
        $configs = WebsiteConfiguration::first();
        if (!$configs) {
            abort(404, 'Configuration not found');
        }
        $request->validate([
            'media' => 'required|array|max:10',
            'media.*' => 'file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $existing = $configs->featured_media ?? [];
        $newFiles = [];

        foreach ($request->file('media') as $file) {
            $newFiles[] = $file->store('featured/media', 'public');
        }

        $combined = array_slice([...$existing, ...$newFiles], 0, 10);
        $configs->featured_media = $combined;
        $configs->save();

        return back()->with('success', 'Media updated successfully!');
    }

    public function deleteFeaturedMedia(Request $request)
    {
        $configs = WebsiteConfiguration::first();

        if (!$configs) {
            abort(404, 'Configuration not found');
        }

        $request->validate([
            'path' => 'required|string',
        ]);

        $media = $configs->featured_media ?? [];
        $media = array_filter($media, fn($url) => $url !== $request->path);

        Storage::disk('public')->delete($request->path);
        $configs->featured_media = array_values($media);
        $configs->save();

        return back()->with('success', 'Media removed.');
    }

    public function uploadStylesMedia(Request $request)
    {
        $request->validate([
            'variant' => 'required|in:styles,media',
            'media' => 'required|array|max:10',
            'media.*' => 'file|mimes:jpg,jpeg,png|max:5120',
        ]);

        foreach ($request->file('media') as $file) {
            $newFile = $file->store('featured/styles_media', 'public');
            StylesMedia::create([
                'model_id' => null,
                'type' => $request->variant,
                'url' => $newFile,
            ]);
        }

        return back()->with('success', 'Media uploaded successfully!');
    }

    public function addStylesMedia(Request $request)
    {
        $request->validate([
            'variant' => 'required|in:styles,media',
            'type' => 'required|in:proof,portfolio',
            'slug' => 'required|string',
            'path' => 'required|string',
        ]);

        StylesMedia::updateOrCreate([
            'model_id' => "{$request->type}:{$request->slug}",
        ], [
            'type' => $request->variant,
            'url' => $request->path,
        ]);
        return back()->with('success', 'Media added successfully!');
    }

    public function deleteStylesMedia(Request $request)
    {

        $request->validate([
            'item_id' => 'required|integer|exists:styles_media,id',
        ]);

        $media = StylesMedia::find($request->item_id);
        if ($media) {
            $media->delete();
            return back()->with('success', 'Media removed successfully.');
        }

        return back()->with('error', 'Media not found.');
    }

    public function notificationShow($id){
        $admin = Auth::guard('admin')->user();
        $notification = $admin->notifications()->where('id', $id)->first();
        if (!$notification) {
            return back()->with('error', 'Something went wrong, please try again');
        }
        return to_route('admin.notifications', ['tab' => $id]);
    }

    public function markNotificationAsRead($id)
    {
        $admin = Auth::guard('admin')->user();

        $success = AdminNotificationHelper::markAsRead($id, $admin->id);

        return back()->with('message', $success ? 'Notification marked as read' : 'Notification not found');
    }

    public function markAllNotificationsAsRead()
    {
        $admin = Auth::guard('admin')->user();
        $count = AdminNotificationHelper::markAllAsRead($admin->id);

        return back()->with('message', "$count Notifications marked as read");
    }
}
