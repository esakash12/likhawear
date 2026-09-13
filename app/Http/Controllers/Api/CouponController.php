<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))
            ->where('active', true)
            ->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid or expired coupon code.',
            ], 422);
        }

        if ($request->subtotal < $coupon->min_order) {
            return response()->json([
                'valid' => false,
                'message' => "This coupon requires a minimum order of ৳{$coupon->min_order}.",
            ], 422);
        }

        $discount = 0;
        if ($coupon->discount_type === 'percentage') {
            $discount = round(($request->subtotal * $coupon->discount_value) / 100);
        } else {
            $discount = min($coupon->discount_value, $request->subtotal);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Coupon applied successfully!',
            'coupon' => $coupon,
            'discountAmount' => $discount,
        ]);
    }

    public function index()
    {
        return response()->json(Coupon::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'discountType' => 'nullable|string|in:percentage,fixed',
            'discount_type' => 'nullable|string|in:percentage,fixed',
            'discountValue' => 'nullable|numeric|min:1',
            'discount_value' => 'nullable|numeric|min:1',
            'minOrder' => 'nullable|numeric|min:0',
            'min_order' => 'nullable|numeric|min:0',
            'active' => 'nullable|boolean',
        ]);

        $code = strtoupper($validated['code']);
        $type = $request->discountType ?? $request->discount_type ?? 'percentage';
        $val = (float) ($request->discountValue ?? $request->discount_value ?? 10);
        $min = (float) ($request->minOrder ?? $request->min_order ?? 0);
        $active = (bool) ($request->has('active') ? $request->active : true);

        $coupon = Coupon::updateOrCreate(
            ['code' => $code],
            [
                'discount_type' => $type,
                'discount_value' => $val,
                'min_order' => $min,
                'active' => $active,
            ]
        );

        return response()->json($coupon, 201);
    }

    public function destroy($code)
    {
        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (!$coupon) {
            return response()->json(['message' => 'Coupon not found'], 404);
        }

        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted successfully']);
    }
}
