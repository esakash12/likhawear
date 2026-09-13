<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'min_order',
        'active',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'min_order' => 'float',
        'active' => 'boolean',
    ];

    protected $appends = [
        'discountType',
        'discountValue',
        'minOrder',
    ];

    public function getDiscountTypeAttribute()
    {
        return $this->attributes['discount_type'] ?? 'percentage';
    }

    public function getDiscountValueAttribute()
    {
        return isset($this->attributes['discount_value']) ? (float) $this->attributes['discount_value'] : 0.0;
    }

    public function getMinOrderAttribute()
    {
        return isset($this->attributes['min_order']) ? (float) $this->attributes['min_order'] : 0.0;
    }
}
