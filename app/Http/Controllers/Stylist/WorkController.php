<?php

namespace App\Http\Controllers\Stylist;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Like;
use App\Models\Portfolio;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkController extends Controller
{
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

    public function portfolioStats(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        $resp = [
            'total_works' => $user->portfolios()->count(),
            'total_likes' => Like::where([
                ['user_id', '=', $user->id],
                ['type', '=', 'portfolio'],
                ['status', '=', true]
            ])->count(),
            'average_rating' => Review::whereHas('appointment', function ($query) use ($stylist) {
                $query->where('stylist_id', $stylist->id);
            })->avg('rating') ?? 0,
        ];

        if ($request->expectsJson()) {
            return $resp;
        }

        return $resp;
    }
}
