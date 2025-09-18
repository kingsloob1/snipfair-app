@extends('errors.__base')
@section('title')
    {{ $title ?? 'Session Expired' }}
@endsection
@section('content')
    <div id="app" data-page="{{ json_encode([
        'component' => 'Errors/GlobalError',
        'props' => [
            'status' => $status ?? 419,
            'title' => $title ?? 'Session Expired',
            'message' => $message ?? 'Your session has expired. Please refresh the page and try again.',
            'action' => $action ?? 'Refresh page',
            'canGoBack' => $canGoBack ?? true,
            'homeUrl' => $homeUrl ?? url('/'),
            'previousUrl' => $previousUrl ?? url()->previous(),
        ],
        'url' => request()->url(),
        'version' => null
    ]) }}"></div>
@endsection