<?php

namespace App\Guards;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class OptionalSanctumAuthGuard implements Guard
{
    protected $request;
    protected $provider;
    protected $user;

    public function __construct(UserProvider $provider, Request $request)
    {
        $this->provider = $provider;
        $this->request = $request;
    }

    /**
     * Determine if the current user is authenticated.
     */
    public function check()
    {
        return !is_null($this->user());
    }

    /**
     * Determine if the current user is a guest.
     */
    public function guest()
    {
        return !$this->check();
    }

    /**
     * Determine if the current user exists.
     */
    public function hasUser()
    {
        return $this->check();
    }

    private function processUserUsingDefaultAuth()
    {
        try {
            $user = Auth::guard('sanctum')->user();
            if ($user) {
                $this->setUser($user);
            }

            return $user;
        } catch (\Exception $e) {
            return null;
        }
    }


    /**
     * Get the currently authenticated user.
     */
    public function user()
    {
        if ($this->user) {
            return $this->user;
        }

        // Example: authenticate via bearer token
        $tokenString = $this->request->bearerToken();

        if (!$tokenString) {
            return $this->processUserUsingDefaultAuth();
        }

        $token = PersonalAccessToken::findToken($tokenString);

        if (!$tokenString) {
            return $this->processUserUsingDefaultAuth();
        }

        $user = $this->provider->retrieveByCredentials(['id' => $token->tokenable_id]);

        if ($user) {
            $this->setUser($user);
        }

        return $this->user;
    }

    /**
     * Get the ID for the authenticated user.
     */
    public function id()
    {
        return $this->user() ? $this->user()->getAuthIdentifier() : null;
    }

    /**
     * Validate a user's credentials.
     */
    public function validate(array $credentials = [])
    {
        $user = $this->provider->retrieveByCredentials($credentials);

        if ($user && $this->provider->validateCredentials($user, $credentials)) {
            $this->setUser($user);
            return true;
        }

        return false;
    }

    /**
     * Manually set the current user.
     */
    public function setUser($user)
    {
        $this->user = $user;

        // set the user in the sanctum guard as well
        Auth::guard('sanctum')->setUser($user);
        return $this;
    }
}
