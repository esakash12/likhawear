<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'customer_name',
        'phone',
        'email',
        'district',
        'area',
        'address',
        'address_label',
        'delivery_note',
        'payment_method',
        'subtotal',
        'delivery_fee',
        'discount',
        'coupon_code',
        'total',
        'status',
        'user_id',
        'courier_name',
        'consignment_id',
        'courier_tracking_code',
        'courier_status',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'discount' => 'float',
        'total' => 'float',
    ];

    protected $appends = [
        'customerName',
        'addressLabel',
        'deliveryNote',
        'paymentMethod',
        'deliveryFee',
        'couponCode',
        'createdAt',
        'trackingEvents',
        'courierName',
        'consignmentId',
        'courierTrackingCode',
        'courierStatus',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function trackings()
    {
        return $this->hasMany(OrderTracking::class)->orderBy('id', 'asc');
    }

    public function getCustomerNameAttribute()
    {
        return $this->attributes['customer_name'] ?? null;
    }

    public function getAddressLabelAttribute()
    {
        return $this->attributes['address_label'] ?? 'Home';
    }

    public function getDeliveryNoteAttribute()
    {
        return $this->attributes['delivery_note'] ?? null;
    }

    public function getPaymentMethodAttribute()
    {
        return $this->attributes['payment_method'] ?? 'cod';
    }

    public function getDeliveryFeeAttribute()
    {
        return isset($this->attributes['delivery_fee']) ? (float) $this->attributes['delivery_fee'] : 0.0;
    }

    public function getCouponCodeAttribute()
    {
        return $this->attributes['coupon_code'] ?? null;
    }

    public function getCreatedAtAttribute($value)
    {
        return $value ? (new \Illuminate\Support\Carbon($value))->toIso8601String() : now()->toIso8601String();
    }

    public function getTrackingEventsAttribute()
    {
        return $this->trackings->map(function ($event) {
            return [
                'status' => $event->status,
                'time' => $event->time,
                'note' => $event->note,
                'location' => $event->location,
            ];
        });
    }

    public function getCourierNameAttribute()
    {
        return $this->attributes['courier_name'] ?? null;
    }

    public function getConsignmentIdAttribute()
    {
        return $this->attributes['consignment_id'] ?? null;
    }

    public function getCourierTrackingCodeAttribute()
    {
        return $this->attributes['courier_tracking_code'] ?? null;
    }

    public function getCourierStatusAttribute()
    {
        return $this->attributes['courier_status'] ?? null;
    }
}
