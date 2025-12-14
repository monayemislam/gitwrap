<?php

use App\Http\Controllers\GitHubController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('/wrapped/{username}', function ($username) {
    return Inertia::render('wrapped', [
        'username' => $username,
    ]);
})->name('wrapped');

Route::get('/api/github', [GitHubController::class, 'fetchData'])->name('api.github');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
