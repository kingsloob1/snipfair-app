<?php

namespace App\Http\Controllers\Stylist;

use App\Http\Controllers\Controller;
use App\Http\Controllers\StylistController;
use App\Models\Category;
use App\Models\Like;
use App\Models\Portfolio;
use App\Models\Review;
use App\Models\Stylist;
use App\Rules\UrlOrFile;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class WorkController extends Controller
{
    private $stylistController;

    public function __construct(StylistController $stylistController)
    {
        $this->stylistController = $stylistController;
    }

    public function work(Request $request)
    {
        $categories = Category::all()->pluck('name');
        $portfolios = Portfolio::where('user_id', $request->user()->id)
            ->with(['category'])
            ->withCount([
                'likes as like_count' => function ($query) {
                    $query->where('type', 'portfolio')->where('status', true);
                }
            ])
            ->get();
        // $portfolio->average_rating;
        return Inertia::render('Stylist/Work/Index', [
            'services' => $categories,
            'portfolios' => $portfolios,
        ]);

        //, 'average_rating'
        //         $portfolios = Portfolio::where('user_id', auth()->id())
        //     ->withCount(['likes as like_count' => function ($query) {
        //         $query->where('type', 'portfolio')->where('status', true);
        //     }])
        //     ->with(['likes' => function ($query) {
        //         $query->where('user_id', auth()->id())->where('type', 'portfolio');
        //     }])
        //     ->get();

        // foreach ($portfolios as $portfolio) {
        //     $likedByMe = $portfolio->likes->first()?->status === true;

        //         $portfolioIds = Portfolio::where('user_id', auth()->id())->pluck('id');

        // $totalLikes = Like::where('type', 'portfolio')
        //     ->whereIn('type_id', $portfolioIds)
        //     ->where('status', true)
        //     ->count();
    }

    public function create()
    {
        $categories = Category::all()->pluck('name');
        return Inertia::render('Stylist/Work/Create', [
            'services' => $categories,
        ]);
    }

    public function portfolio(Request $request)
    {
        $portfolios = Portfolio::where('user_id', $request->user()->id)
            ->with(['category'])
            ->withCount([
                'likes as like_count' => function ($query) {
                    $query->where('type', 'portfolio')->where('status', true);
                }
            ])
            ->get();

        $resp = [
            'portfolios' => $portfolios,
            'statistics' => [
                'total_works' => $request->user()->portfolios()->count(),
                'total_likes' => 0,
                'average_rating' => 1,
            ]
        ];

        if ($request->expectsJson()) {
            return $resp;
        }

        return Inertia::render('Stylist/Portfolio', $resp);
    }

    public function getWorkCategories(Request $request)
    {
        return Category::where([
            ['status', '=', true]
        ])->get()->all();
    }

    public function getWorkList(Request $request)
    {
        $query = $request->query('query');
        $perPage = formatPerPage($request);

        $categoryId = $request->query('category_id');
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $portfolioQueryBuilder = $user->portfolios();
        if ($query) {
            $portfolioQueryBuilder = $portfolioQueryBuilder->whereLike('title', '%' . $query . '%', false);
        }

        if ($categoryId) {
            $portfolioQueryBuilder = $portfolioQueryBuilder->where('category_id', $categoryId);
        }

        $portfolios = $portfolioQueryBuilder->with(['category'])->withCount(['likes'])->cursorPaginate($perPage, ['*'], 'page');

        return $portfolios;
    }

    public function createWork(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'sometimes|string|max:255',
            'category_id' => [
                Rule::requiredIf(!$request->input('category')),
                Rule::exists('categories', 'id')
            ],
            'price' => 'required|numeric|min:0|gt:0',
            'duration' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'required|string',
            'media' => 'required|array|min:4|max:10',
            'media.*' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,gif,webp',
                'max:5120'
            ]
        ]);

        $adminConfig = getAdminConfig();
        $minBookingAmount = Arr::get($adminConfig ?? [], 'min_booking_amount');
        $maxBookingAmount = Arr::get($adminConfig ?? [], 'max_booking_amount');

        if ($minBookingAmount && $request->price < $minBookingAmount) {
            throw new BadRequestHttpException('Minimum booking amount is R' . $minBookingAmount);
        }

        if ($maxBookingAmount && $request->price > $maxBookingAmount) {
            throw new BadRequestHttpException('Maximum booking amount is R' . $maxBookingAmount);
        }

        $category = $request->input('category_id') ? Category::where('id', $validated['category_id'])->first() : Category::where('name', $validated['category'])->first();

        if (!$category) {
            throw new BadRequestHttpException('Selected work category is invalid');
        }

        $mediaPaths = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $mediaPaths[] = $file->store('works/media', 'public');
            }
        }

        $work = Portfolio::create([
            'title' => $validated['title'],
            'category_id' => $category->id,
            'price' => $validated['price'],
            'duration' => $validated['duration'],
            'description' => $validated['description'],
            'tags' => $validated['tags'],
            'media_urls' => $mediaPaths,
            'user_id' => $user->id,
        ]);

        if (!$work) {
            throw new BadRequestHttpException('An error occurred while saving your service');
        }

        $this->stylistController->checkProfileCompleteness($user, false);

        $work->load(['category'])->loadCount(['likes']);

        return $work;
    }

    public function getWork(Request $request, $id)
    {

        $user = $request->user();
        $stylist = $user->stylist_profile;
        $work = $user->portfolios()->where('id', $id)
            ->with(['category'])
            ->withCount(['likes'])
            ->first();

        if (!$user || !$stylist || !$work) {
            abort(403, 'Access Denied');
        }

        return $work;
    }

    public function updateWork(Request $request, $id)
    {

        $user = $request->user();
        $stylist = $user->stylist_profile;
        $work = $user->portfolios()->where('id', $id)->first();

        if (!$user || !$stylist || !$work) {
            abort(403, 'Access Denied');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'sometimes|string|max:255',
            'category_id' => [
                Rule::requiredIf(!$request->input('category')),
                Rule::exists('categories', 'id')
            ],
            'price' => 'required|numeric|min:0|gt:0',
            'duration' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'required|string',
            'media' => 'required|array|min:4|max:10',
            'media.*' => [
                new UrlOrFile(
                    urlAndFileRules: [
                        'url' => [
                            'required',
                            'url',
                            'starts_with:' . URL::to('/storage')
                        ],
                        'file' => [
                            'required',
                            'file',
                            'mimes:jpg,jpeg,png,gif,webp',
                            'max:5120'
                        ]
                    ],
                    urlAndFileMessages: [
                        'url' => [
                            'required' => 'Media URL is required',
                            'url' => 'Media URL is invalid',
                            'starts_with' => 'Media URL is invalid'
                        ],
                        'file' => [
                            'required' => 'Media file is required',
                            'file' => 'Media file is invalid',
                            'mimes' => 'Media file must be a valid image',
                            'max' => 'Media file size must be less than 5MB',
                        ]
                    ]
                )
            ],
        ]);

        $adminConfig = getAdminConfig();
        $minBookingAmount = Arr::get($adminConfig ?? [], 'min_booking_amount');
        $maxBookingAmount = Arr::get($adminConfig ?? [], 'max_booking_amount');

        if ($minBookingAmount && $request->price < $minBookingAmount) {
            throw new BadRequestHttpException('Minimum booking amount is R' . $minBookingAmount);
        }

        if ($maxBookingAmount && $request->price > $maxBookingAmount) {
            throw new BadRequestHttpException('Maximum booking amount is R' . $maxBookingAmount);
        }

        $category = $request->input('category_id') ? Category::where('id', $validated['category_id'])->first() : Category::where('name', $validated['category'])->first();

        if (!$category) {
            throw new BadRequestHttpException('Selected work category is invalid');
        }

        $existingMediaList = $work->media_urls ?? [];
        if (!is_array($existingMediaList)) {
            $existingMediaList = [];
        }

        $retainedMediaList = $request->input('media') ?? [];
        if (!is_array($retainedMediaList)) {
            $retainedMediaList = [];
        }

        //Formatted retained file paths and select only paths that exists
        $retainedMediaList = Arr::where(Arr::map($retainedMediaList, function ($fileUrl): string {
            return formatStoredFilePath($fileUrl);
        }), fn(string $filePath): string => !!$filePath);

        $validMedia = [];
        $removedMedia = [];

        //Iterate through existing media and delete removed media and curate valid work media
        foreach ($existingMediaList as $filePath) {
            $filePath = formatStoredFilePath($filePath);

            if ($filePath) {
                if (in_array($filePath, $retainedMediaList)) {
                    $validMedia[] = $filePath;
                } else {
                    $removedMedia[] = $filePath;
                }
            }
        }

        foreach (($request->file('media') ?? []) as $file) {
            $validMedia[] = $file->store('works/media', 'public');
        }

        $work->update(array_merge(Arr::only($validated, ['title', 'price', 'duration', 'description', 'tags']), [
            'category_id' => $category->id,
            'media_urls' => $validMedia,
        ]));

        $disk = Storage::disk('public');
        foreach ($removedMedia as $mediaPath) {
            $disk->delete($mediaPath);
        }

        $work->refresh();
        $work->load(['category'])->loadCount(['likes']);

        $this->stylistController->checkProfileCompleteness($user, false);

        return $work;
    }

    public function updateWorkStatus(Request $request, $id)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;
        $work = $user->portfolios()->where('id', $id)
            ->with(['category'])
            ->withCount(['likes'])
            ->first();

        if (!$user || !$stylist || !$work) {
            abort(403, 'Access Denied');
        }

        $validated = $request->validate([
            'is_available' => 'required|boolean',
        ]);

        $work->is_available = !!$validated['is_available'];
        $work->save();

        $work->refresh();

        return $work;
    }

    public function deleteWork(Request $request, $id)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;
        $work = $user->portfolios()->where('id', $id)->first();

        if (!$user || !$stylist || !$work) {
            abort(403, 'Access Denied');
        }

        $work->delete();

        $this->stylistController->checkProfileCompleteness($user, false);

        return response()->noContent();
    }
}
