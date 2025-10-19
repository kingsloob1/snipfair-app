<?php

namespace App\Guards;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class QueryTokenGuard implements Guard
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


    /**
     * Get the currently authenticated user.
     */
    public function user()
    {
        if ($this->user) {
            return $this->user;
        }

        // Example: authenticate via auth_token in query string
        $tokenString = urldecode($this->request->input('auth_token', ''));

        if (!$tokenString) {
            return Auth::guard('sanctum')->user();
        }

        $token = PersonalAccessToken::findToken($tokenString);

        if (!$tokenString) {
            return Auth::guard('sanctum')->user();
        }

        $user = $this->provider->retrieveByCredentials(['id' => $token->tokenable_id]);

        if ($user) {
            $this->setUser($user);
            session(['auth:from:app' => true]);
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
        Auth::guard('web')->login($this->user);
        session()->save(); //Ensure session is persisted to the storage
        return $this;
    }
}
