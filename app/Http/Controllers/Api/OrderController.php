<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Coupon;
use App\Models\CmsContent;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customerName' => 'required|string|max:150',
            'phone' => ['required', 'string', 'regex:/^(?:\+?88|88)?01[3-9]\d{8}$/'],
            'email' => 'nullable|email|max:150',
            'district' => 'required|string|max:100',
            'area' => 'nullable|string|max:100',
            'address' => 'required|string',
            'addressLabel' => 'nullable|string',
            'deliveryNote' => 'nullable|string',
            'paymentMethod' => 'required|string|in:cod,bkash',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'nullable|string',
            'items.*.product_id' => 'nullable|string',
            'items.*.title' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.image' => 'nullable|string',
            'items.*.selectedColor' => 'nullable|string',
            'items.*.selected_color' => 'nullable|string',
            'items.*.selectedSize' => 'nullable|string',
            'items.*.selected_size' => 'nullable|string',
            'couponCode' => 'nullable|string',
        ]);

        // Calculate Subtotal
        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $subtotal += ($item['price'] * $item['quantity']);
        }

        // Calculate Shipping
        $shippingSetting = CmsContent::where('key', 'shipping')->first();
        $insideFee = $shippingSetting['value']['insideDhakaFee'] ?? 70;
        $outsideFee = $shippingSetting['value']['outsideDhakaFee'] ?? 130;
        $freeThreshold = $shippingSetting['value']['freeShippingThreshold'] ?? 2500;

        $isDhaka = stripos($validated['district'], 'dhaka') !== false;
        $deliveryFee = $subtotal >= $freeThreshold ? 0 : ($isDhaka ? $insideFee : $outsideFee);

        // Calculate Coupon Discount
        $discount = 0;
        $couponCode = null;
        if (!empty($validated['couponCode'])) {
            $coupon = Coupon::where('code', strtoupper($validated['couponCode']))
                ->where('active', true)
                ->first();

            if ($coupon && $subtotal >= $coupon->min_order) {
                $couponCode = $coupon->code;
                if ($coupon->discount_type === 'percentage') {
                    $discount = round(($subtotal * $coupon->discount_value) / 100);
                } else {
                    $discount = min($coupon->discount_value, $subtotal);
                }
            }
        }

        $total = max(0, $subtotal + $deliveryFee - $discount);

        // Generate ID
        $orderId = 'ZN-' . date('Y') . '-' . rand(1000, 9999);
        while (Order::where('id', $orderId)->exists()) {
            $orderId = 'ZN-' . date('Y') . '-' . rand(1000, 9999);
        }

        $cleanPhone = preg_replace('/\D/', '', $validated['phone']);
        if (str_starts_with($cleanPhone, '8801')) {
            $cleanPhone = substr($cleanPhone, 2);
        }

        // Validate stock availability for each item and variant
        foreach ($validated['items'] as $item) {
            $prodId = $item['productId'] ?? $item['product_id'] ?? null;
            if ($prodId) {
                $product = Product::find($prodId);
                if ($product) {
                    $color = $item['selectedColor'] ?? $item['selected_color'] ?? '';
                    $size = $item['selectedSize'] ?? $item['selected_size'] ?? '';
                    $reqQty = (int) $item['quantity'];

                    $variants = $product->variants;
                    if (is_string($variants)) $variants = json_decode($variants, true) ?: [];

                    $availStock = $product->stock_count;
                    if (is_array($variants) && count($variants) > 0) {
                        foreach ($variants as $v) {
                            $matchColor = empty($v['color']) || strcasecmp(trim($v['color']), trim($color)) === 0;
                            $matchSize = empty($v['size']) || strcasecmp(trim($v['size']), trim($size)) === 0;
                            if ($matchColor && $matchSize) {
                                $availStock = (int) ($v['stock'] ?? 0);
                                break;
                            }
                        }
                    }

                    if ($availStock < $reqQty) {
                        $varLabel = $color || $size ? " ({$color} - {$size})" : '';
                        return response()->json([
                            'message' => "স্টক অপ্রতুল: {$item['title']}{$varLabel} এর স্টক আছে মাত্র {$availStock} টি, কিন্তু আপনি চেয়েছেন {$reqQty} টি।",
                        ], 422);
                    }
                }
            }
        }

        $order = Order::create([
            'id' => $orderId,
            'customer_name' => $validated['customerName'],
            'phone' => $cleanPhone,
            'email' => $validated['email'] ?? null,
            'district' => $validated['district'],
            'area' => $validated['area'] ?? '',
            'address' => $validated['address'],
            'address_label' => $validated['addressLabel'] ?? 'Home',
            'delivery_note' => $validated['deliveryNote'] ?? null,
            'payment_method' => $validated['paymentMethod'],
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'discount' => $discount,
            'coupon_code' => $couponCode,
            'total' => $total,
            'status' => 'Pending',
        ]);

        foreach ($validated['items'] as $item) {
            $prodId = $item['productId'] ?? $item['product_id'] ?? null;
            $color = $item['selectedColor'] ?? $item['selected_color'] ?? null;
            $size = $item['selectedSize'] ?? $item['selected_size'] ?? null;

            $order->items()->create([
                'product_id' => $prodId,
                'title' => $item['title'],
                'price' => $item['price'],
                'image' => $item['image'] ?? null,
                'selected_color' => $color,
                'selected_size' => $size,
                'quantity' => $item['quantity'],
            ]);

            // Decrement Stock in Database for specific color & size variant
            if ($prodId) {
                $product = Product::find($prodId);
                if ($product) {
                    $qty = (int) $item['quantity'];

                    $variants = $product->variants;
                    if (is_string($variants)) $variants = json_decode($variants, true) ?: [];

                    if (is_array($variants) && count($variants) > 0) {
                        foreach ($variants as &$v) {
                            $matchColor = empty($v['color']) || strcasecmp(trim($v['color']), trim($color)) === 0;
                            $matchSize = empty($v['size']) || strcasecmp(trim($v['size']), trim($size)) === 0;
                            if ($matchColor && $matchSize) {
                                $v['stock'] = max(0, ((int) ($v['stock'] ?? 0)) - $qty);
                                break;
                            }
                        }
                        unset($v);

                        $totalStock = 0;
                        foreach ($variants as $v) {
                            $totalStock += (int) ($v['stock'] ?? 0);
                        }
                        $product->variants = $variants;
                        $product->stock_count = $totalStock;
                        $product->in_stock = $totalStock > 0;
                    } else {
                        $newStock = max(0, $product->stock_count - $qty);
                        $product->stock_count = $newStock;
                        $product->in_stock = $newStock > 0;
                    }
                    $product->save();
                }
            }
        }

        $order->trackings()->create([
            'status' => 'Pending',
            'time' => now()->format('d M Y, h:i A'),
            'note' => 'Order placed successfully and is pending confirmation.',
            'location' => $isDhaka ? 'Dhaka Hub' : 'Central Processing Hub',
        ]);

        $order->load(['items', 'trackings']);

        return response()->json($order, 201);
    }

    public function track($idOrPhone)
    {
        $query = Order::with(['items', 'trackings']);

        if (str_starts_with(strtoupper($idOrPhone), 'ZN-')) {
            $order = $query->where('id', strtoupper($idOrPhone))->first();
            if ($order) {
                return response()->json([$order]);
            }
        }

        $orders = $query->where('phone', $idOrPhone)
            ->orWhere('id', strtoupper($idOrPhone))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function adminIndex(Request $request)
    {
        $query = Order::with(['items', 'trackings'])->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        return response()->json($query->get());
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::with(['items', 'trackings'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $request->validate([
            'status' => 'required|string|in:Pending,Confirmed,Processing,Shipped,Delivered,Cancelled',
            'note' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $order->status = $request->status;
        $order->save();

        $defaultNotes = [
            'Pending' => 'Order received and waiting for confirmation.',
            'Confirmed' => 'Order has been confirmed by our customer support.',
            'Processing' => 'Items are being packed and prepared for shipment.',
            'Shipped' => 'Order has been dispatched with delivery courier.',
            'Delivered' => 'Order successfully delivered to customer.',
            'Cancelled' => 'Order was cancelled.',
        ];

        $note = $request->note ?: ($defaultNotes[$request->status] ?? 'Status updated to ' . $request->status);

        $order->trackings()->create([
            'status' => $request->status,
            'time' => now()->format('d M Y, h:i A'),
            'note' => $note,
            'location' => $request->location ?? 'Dhaka Logistics Hub',
        ]);

        $order->load(['items', 'trackings']);

        return response()->json($order);
    }

    public function addTrackingEvent(Request $request, $id)
    {
        $order = Order::with(['items', 'trackings'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $request->validate([
            'status' => 'required|string',
            'note' => 'required|string',
            'location' => 'nullable|string',
        ]);

        $order->trackings()->create([
            'status' => $request->status,
            'time' => now()->format('d M Y, h:i A'),
            'note' => $request->note,
            'location' => $request->location ?? 'Hub',
        ]);

        if (in_array($request->status, ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])) {
            $order->status = $request->status;
            $order->save();
        }

        $order->load(['items', 'trackings']);

        return response()->json($order);
    }
}
