<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class AdminHelper
{
    public static function currentAdmin()
    {
        return Auth::guard('admin')->user();
    }

    public static function hasRole(string $role): bool
    {
        $admin = self::currentAdmin();
        return $admin ? $admin->hasRole($role) : false;
    }

    public static function hasAnyRole(array $roles): bool
    {
        $admin = self::currentAdmin();
        return $admin ? $admin->hasAnyRole($roles) : false;
    }

    public static function isSuperAdmin(): bool
    {
        return self::hasRole('super-admin');
    }

    public static function isModerator(): bool
    {
        return self::hasRole('moderator');
    }

    public static function isSupportAdmin(): bool
    {
        return self::hasRole('support-admin');
    }
}
