<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Collection;

class GeneralController extends Controller
{
    public function getPlatformSettings()
    {
        $config = getAdminConfig();
        if ($config) {
            return array_merge($config->toArray(), [
                'portfolio_price_filters' => [
                    [
                        'label' => 'Any',
                        'max' => null,
                        'min' => 0,
                        'is_default' => true
                    ],
                    [
                        'label' => 'Below R500',
                        'max' => 500,
                        'min' => 0,
                        'is_default' => false
                    ],
                    [
                        'label' => 'R500 - R600',
                        'max' => 600,
                        'min' => 500,
                        'is_default' => false
                    ],
                    [
                        'label' => 'R600 - R800',
                        'max' => 800,
                        'min' => 600,
                        'is_default' => false
                    ],
                    [
                        'label' => 'R800 - R1500',
                        'max' => 1500,
                        'min' => 900,
                        'is_default' => false
                    ],
                    [
                        'label' => 'R1500 and Above',
                        'max' => null,
                        'min' => 1500,
                        'is_default' => false
                    ]
                ]
            ]);
        }

        return null;
    }
}
