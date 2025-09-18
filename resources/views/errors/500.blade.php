@extends('errors.__base')
@section('title')
    {{ $title ?? 'Server Error' }}
@endsection
@section('content')
    <div id="app" data-page="{{ json_encode([
        'component' => 'Errors/GlobalError',
        'props' => [
            'status' => $status ?? 500,
            'title' => $title ?? 'Server Error',
            'message' => $message ?? 'Something went wrong on our end. We have been notified and are working to fix it.',
            'action' => $action ?? 'Try again',
            'canGoBack' => $canGoBack ?? true,
            'homeUrl' => $homeUrl ?? url('/'),
            'previousUrl' => $previousUrl ?? url()->previous(),
        ],
        'url' => request()->url(),
        'version' => null
    ]) }}"></div>
@endsection
