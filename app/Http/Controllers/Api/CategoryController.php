<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
        ]);

        foreach ($validated['categories'] as $cat) {
            Category::updateOrCreate(
                ['id' => $cat['id'] ?? 'cat-' . Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'slug' => $cat['slug'] ?? Str::slug($cat['name']),
                    'image' => $cat['image'] ?? null,
                    'subcategories' => $cat['subcategories'] ?? [],
                ]
            );
        }

        return response()->json(Category::all());
    }
}
