<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Serves the React SPA shell for all storefront and admin views.
| Excludes /api and /uploads so they are handled directly by Laravel & static file server.
|
*/
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|uploads).*$');
