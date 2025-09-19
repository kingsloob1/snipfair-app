<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class GeneralController extends Controller
{
    public function getPlatformSettings()
    {
        return getAdminConfig();
    }
}
