<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function index(Request $request){
        $user = $request->user();

        return inertia('Customer/Profile/Index', [
            'user' => $user,
            'services' => $user->services->pluck('name'),
            'certifications' => $user->certifications,
            'reviews' => $user->reviews()->with(['stylist'])->get(),
        ]);
    }
}
