<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'slug',
        'category',
        'subcategory',
        'price',
        'compare_at_price',
        'discount_percent',
        'is_featured',
        'is_top_selling',
        'rating',
        'reviews_count',
        'in_stock',
        'stock_count',
        'sku',
        'colors',
        'sizes',
        'images',
        'description_en',
        'description_bn',
        'tags',
        'specifications',
        'variants',
        'product_info',
    ];

    protected $casts = [
        'price' => 'float',
        'compare_at_price' => 'float',
        'discount_percent' => 'integer',
        'is_featured' => 'boolean',
        'is_top_selling' => 'boolean',
        'rating' => 'float',
        'reviews_count' => 'integer',
        'in_stock' => 'boolean',
        'stock_count' => 'integer',
        'colors' => 'array',
        'sizes' => 'array',
        'images' => 'array',
        'tags' => 'array',
        'specifications' => 'array',
        'variants' => 'array',
        'product_info' => 'array',
    ];

    protected $appends = [
        'compareAtPrice',
        'discountPercent',
        'isFeatured',
        'isTopSelling',
        'reviewsCount',
        'inStock',
        'stockCount',
        'descriptionEn',
        'descriptionBn',
        'variants',
        'productInfo',
    ];

    public function getCompareAtPriceAttribute()
    {
        return isset($this->attributes['compare_at_price']) ? (float) $this->attributes['compare_at_price'] : null;
    }

    public function getDiscountPercentAttribute()
    {
        return isset($this->attributes['discount_percent']) ? (int) $this->attributes['discount_percent'] : 0;
    }

    public function getIsFeaturedAttribute()
    {
        return !empty($this->attributes['is_featured']);
    }

    public function getIsTopSellingAttribute()
    {
        return !empty($this->attributes['is_top_selling']);
    }

    public function getReviewsCountAttribute()
    {
        return isset($this->attributes['reviews_count']) ? (int) $this->attributes['reviews_count'] : 0;
    }

    public function getInStockAttribute()
    {
        return !empty($this->attributes['in_stock']);
    }

    public function getStockCountAttribute()
    {
        return isset($this->attributes['stock_count']) ? (int) $this->attributes['stock_count'] : 0;
    }

    public function getDescriptionEnAttribute()
    {
        return $this->attributes['description_en'] ?? '';
    }

    public function getDescriptionBnAttribute()
    {
        return $this->attributes['description_bn'] ?? '';
    }

    public function getProductInfoAttribute()
    {
        if (isset($this->attributes['product_info'])) {
            $val = $this->attributes['product_info'];
            return is_string($val) ? json_decode($val, true) : $val;
        }
        return [];
    }

    public function getVariantsAttribute()
    {
        if (isset($this->attributes['variants'])) {
            $val = $this->attributes['variants'];
            return is_string($val) ? json_decode($val, true) : (array) $val;
        }
        return [];
    }
}
