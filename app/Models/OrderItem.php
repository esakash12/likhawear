<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'title',
        'price',
        'image',
        'selected_color',
        'selected_size',
        'quantity',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
    ];

    protected $appends = [
        'productId',
        'selectedColor',
        'selectedSize',
    ];

    public function getProductIdAttribute()
    {
        return $this->attributes['product_id'] ?? null;
    }

    public function getSelectedColorAttribute()
    {
        return $this->attributes['selected_color'] ?? null;
    }

    public function getSelectedSizeAttribute()
    {
        return $this->attributes['selected_size'] ?? null;
    }
}
