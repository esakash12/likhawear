<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('subcategory')) {
            $query->where('subcategory', $request->subcategory);
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', filter_var($request->featured, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('top_selling')) {
            $query->where('is_top_selling', filter_var($request->top_selling, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description_en', 'like', "%{$search}%")
                  ->orWhere('description_bn', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $products = $query->get();

        return response()->json($products);
    }

    public function show($slugOrId)
    {
        $product = Product::where('slug', $slugOrId)
            ->orWhere('id', $slugOrId)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'compareAtPrice' => 'nullable|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'stockCount' => 'nullable|integer|min:0',
            'stock_count' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100',
            'colors' => 'nullable|array',
            'sizes' => 'nullable|array',
            'images' => 'nullable|array',
            'descriptionEn' => 'nullable|string',
            'description_en' => 'nullable|string',
            'descriptionBn' => 'nullable|string',
            'description_bn' => 'nullable|string',
            'tags' => 'nullable|array',
            'specifications' => 'nullable|array',
            'productInfo' => 'nullable|array',
            'product_info' => 'nullable|array',
        ]);

        $slug = $request->filled('slug') 
            ? Str::slug($request->slug) 
            : Str::slug($validated['title']) . '-' . Str::random(4);

        $id = $request->filled('id') ? $request->id : 'prod-' . time() . '-' . rand(100, 999);

        $price = (float) $validated['price'];
        $compareAtPrice = (float) ($request->compareAtPrice ?? $request->compare_at_price ?? $price);
        $discountPercent = $compareAtPrice > $price 
            ? (int) round((($compareAtPrice - $price) / $compareAtPrice) * 100) 
            : 0;

        $variants = $request->variants ?? [];
        if (!empty($variants) && is_array($variants)) {
            $stockCount = 0;
            foreach ($variants as $v) {
                $stockCount += (int) ($v['stock'] ?? 0);
            }
        } else {
            $stockCount = (int) ($request->stockCount ?? $request->stock_count ?? 10);
        }

        $product = Product::create([
            'id' => $id,
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'subcategory' => $request->subcategory,
            'price' => $price,
            'compare_at_price' => $compareAtPrice,
            'discount_percent' => $discountPercent,
            'is_featured' => (bool) ($request->isFeatured ?? $request->is_featured ?? false),
            'is_top_selling' => (bool) ($request->isTopSelling ?? $request->is_top_selling ?? false),
            'rating' => (float) ($request->rating ?? 5.0),
            'reviews_count' => (int) ($request->reviewsCount ?? $request->reviews_count ?? 0),
            'in_stock' => $stockCount > 0,
            'stock_count' => $stockCount,
            'sku' => $request->sku ?? strtoupper(Str::random(8)),
            'colors' => $request->colors ?? [],
            'sizes' => $request->sizes ?? [],
            'images' => $request->images ?? [],
            'description_en' => $request->descriptionEn ?? $request->description_en ?? '',
            'description_bn' => $request->descriptionBn ?? $request->description_bn ?? '',
            'tags' => $request->tags ?? [],
            'specifications' => $request->specifications ?? [],
            'variants' => $variants,
            'product_info' => $request->productInfo ?? $request->product_info ?? [],
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $data = [];

        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('slug')) $data['slug'] = Str::slug($request->slug);
        if ($request->has('category')) $data['category'] = $request->category;
        if ($request->has('subcategory')) $data['subcategory'] = $request->subcategory;
        if ($request->has('sku')) $data['sku'] = $request->sku;

        if ($request->has('price')) {
            $data['price'] = (float) $request->price;
        }

        if ($request->has('compareAtPrice') || $request->has('compare_at_price')) {
            $data['compare_at_price'] = (float) ($request->compareAtPrice ?? $request->compare_at_price);
        }

        $price = $data['price'] ?? $product->price;
        $compare = $data['compare_at_price'] ?? $product->compare_at_price;
        if ($compare && $compare > $price) {
            $data['discount_percent'] = (int) round((($compare - $price) / $compare) * 100);
        } else {
            $data['discount_percent'] = 0;
        }

        if ($request->has('stockCount') || $request->has('stock_count')) {
            $stock = (int) ($request->stockCount ?? $request->stock_count);
            $data['stock_count'] = $stock;
            $data['in_stock'] = $stock > 0;
        }

        if ($request->has('isFeatured') || $request->has('is_featured')) {
            $data['is_featured'] = (bool) ($request->isFeatured ?? $request->is_featured);
        }

        if ($request->has('isTopSelling') || $request->has('is_top_selling')) {
            $data['is_top_selling'] = (bool) ($request->isTopSelling ?? $request->is_top_selling);
        }

        if ($request->has('colors')) $data['colors'] = $request->colors;
        if ($request->has('sizes')) $data['sizes'] = $request->sizes;
        if ($request->has('images')) $data['images'] = $request->images;
        if ($request->has('tags')) $data['tags'] = $request->tags;
        if ($request->has('specifications')) $data['specifications'] = $request->specifications;
        if ($request->has('variants')) {
            $vars = $request->variants ?? [];
            $data['variants'] = $vars;
            if (is_array($vars) && count($vars) > 0) {
                $totalStock = 0;
                foreach ($vars as $v) {
                    $totalStock += (int) ($v['stock'] ?? 0);
                }
                $data['stock_count'] = $totalStock;
                $data['in_stock'] = $totalStock > 0;
            }
        }
        if ($request->has('productInfo') || $request->has('product_info')) {
            $data['product_info'] = $request->productInfo ?? $request->product_info;
        }
        if ($request->has('descriptionEn') || $request->has('description_en')) {
            $data['description_en'] = $request->descriptionEn ?? $request->description_en;
        }
        if ($request->has('descriptionBn') || $request->has('description_bn')) {
            $data['description_bn'] = $request->descriptionBn ?? $request->description_bn;
        }

        $product->update($data);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
