@extends('errors.__base')
@section('title')
    {{ $title ?? 'Error' }}
@endsection
@section('content')
    <div id="app" data-page="{{ json_encode([
        'component' => 'Errors/GlobalError',
        'props' => [
            'status' => $status ?? 500,
            'title' => $title ?? 'Something Went Wrong',
            'message' => $message ?? 'An unexpected error occurred. Please try again.',
            'action' => $action ?? 'Try again',
            'canGoBack' => $canGoBack ?? true,
            'homeUrl' => $homeUrl ?? url('/'),
            'previousUrl' => $previousUrl ?? url()->previous(),
        ],
        'url' => request()->url(),
        'version' => null
    ]) }}"></div>
@endsection
