<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;
use Inertia\Inertia;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        $response = parent::render($request, $e);

        // Only handle specific error codes we care about
        if (!in_array($response->getStatusCode(), [404, 419, 429, 500, 503])) {
            return $response;
        }

        // Check if this is an Inertia request
        if ($request->header('X-Inertia')) {
            return $this->renderInertiaError($request, $e, $response->getStatusCode());
        }

        // For non-Inertia requests, render custom error pages
        return $this->renderCustomErrorPage($request, $e, $response->getStatusCode());
    }

    /**
     * Render Inertia error response
     */
    protected function renderInertiaError($request, Throwable $e, int $statusCode)
    {
        $errorData = $this->getErrorData($statusCode, $e);
        
        // For form submissions (POST, PUT, PATCH, DELETE), return as validation error
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return back()->withErrors([
                'error' => $errorData['message']
            ])->with('errorType', $statusCode);
        }

        // For GET requests, render error component
        return Inertia::render('Errors/GlobalError', $errorData)
            ->toResponse($request)
            ->setStatusCode($statusCode);
    }

    /**
     * Render custom error page for non-Inertia requests
     */
    protected function renderCustomErrorPage($request, Throwable $e, int $statusCode)
    {
        $errorData = $this->getErrorData($statusCode, $e);

        // Check if custom error view exists
        if (view()->exists("errors.{$statusCode}")) {
            return response()->view("errors.{$statusCode}", $errorData, $statusCode);
        }

        // Fallback to generic error view
        return response()->view('errors.generic', $errorData, $statusCode);
    }

    /**
     * Get standardized error data
     */
    protected function getErrorData(int $statusCode, Throwable $e): array
    {
        $errorMessages = [
            404 => [
                'title' => 'Page Not Found',
                'message' => 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
                'action' => 'Go back to safety'
            ],
            419 => [
                'title' => 'Session Expired',
                'message' => 'Your session has expired. Please refresh the page and try again.',
                'action' => 'Refresh page'
            ],
            429 => [
                'title' => 'Too Many Requests',
                'message' => 'You have made too many requests. Please wait a moment and try again.',
                'action' => 'Try again later'
            ],
            500 => [
                'title' => 'Server Error',
                'message' => 'Something went wrong on our end. We have been notified and are working to fix it.',
                'action' => 'Try again'
            ],
            503 => [
                'title' => 'Service Unavailable',
                'message' => 'We are currently performing maintenance. Please try again in a few minutes.',
                'action' => 'Check back soon'
            ]
        ];

        $defaultError = [
            'title' => 'Something Went Wrong',
            'message' => 'An unexpected error occurred. Please try again.',
            'action' => 'Try again'
        ];

        $error = $errorMessages[$statusCode] ?? $defaultError;

        return [
            'status' => $statusCode,
            'title' => $error['title'],
            'message' => $error['message'],
            'action' => $error['action'],
            'canGoBack' => request()->header('referer') !== null,
            'homeUrl' => url('/'),
            'previousUrl' => url()->previous(),
        ];
    }
}