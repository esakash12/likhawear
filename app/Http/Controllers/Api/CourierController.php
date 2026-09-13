<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderTracking;
use App\Models\CmsContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CourierController extends Controller
{
    /**
     * Dispatch an order to Steadfast Courier API.
     */
    public function dispatchSteadfast(Request $request, $id)
    {
        $order = Order::with('items')->findOrFail($id);

        // Check if already dispatched
        if (!empty($order->consignment_id)) {
            return response()->json([
                'message' => "Order #{$order->id} is already dispatched with Consignment ID {$order->consignment_id}",
                'order' => $order,
            ], 200);
        }

        // Fetch courier credentials from CMS Settings
        $cms = CmsContent::find('default');
        $data = $cms ? $cms->data : [];
        $courierConfig = $data['courierSettings']['steadfast'] ?? [];

        $apiKey = $courierConfig['apiKey'] ?? env('STEADFAST_API_KEY');
        $secretKey = $courierConfig['secretKey'] ?? env('STEADFAST_SECRET_KEY');

        $codAmount = ($order->payment_method === 'cod') ? (float)$order->total : 0.0;

        $consignmentId = null;
        $trackingCode = null;
        $status = 'in_review';

        if (empty($apiKey) || empty($secretKey)) {
            return response()->json([
                'message' => 'Steadfast Courier API credentials are not configured. Please go to Admin CMS > API Integrations and provide your Steadfast API Key and Secret Key.',
            ], 422);
        }

        try {
            $response = Http::withHeaders([
                'Api-Key' => $apiKey,
                'Secret-Key' => $secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->post('https://portal.steadfast.courier/api/v1/create_order', [
                'invoice' => $order->id,
                'recipient_name' => $order->customer_name,
                'recipient_phone' => preg_replace('/[^0-9]/', '', $order->phone),
                'recipient_address' => $order->address . ($order->district ? ", {$order->district}" : ''),
                'cod_amount' => $codAmount,
                'note' => $order->delivery_note ?: 'Handle with care - Zinnia Bangladesh',
            ]);

            if ($response->successful()) {
                $resData = $response->json();
                if (($resData['status'] ?? 0) === 200 && isset($resData['consignment'])) {
                    $consignmentId = (string)($resData['consignment']['consignment_id'] ?? '');
                    $trackingCode = (string)($resData['consignment']['tracking_code'] ?? '');
                    $status = (string)($resData['consignment']['status'] ?? 'in_review');
                } else {
                    return response()->json([
                        'message' => 'Steadfast API returned an error: ' . ($resData['message'] ?? 'Could not create consignment'),
                    ], 422);
                }
            } else {
                return response()->json([
                    'message' => 'Steadfast Courier API HTTP ' . $response->status() . ': ' . $response->body(),
                ], 422);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Connection to Steadfast Courier failed: ' . $e->getMessage(),
            ], 500);
        }

        // Update order with courier details
        $order->courier_name = 'steadfast';
        $order->consignment_id = $consignmentId;
        $order->courier_tracking_code = $trackingCode;
        $order->courier_status = $status;
        $order->status = 'shipped';
        $order->save();

        // Add a tracking milestone
        OrderTracking::create([
            'order_id' => $order->id,
            'status' => 'shipped',
            'time' => now()->format('M d, Y h:i A'),
            'note' => "Handed over to Steadfast Courier (Consignment: {$consignmentId}, Tracking: {$trackingCode})",
            'location' => 'Dhaka Logistics Hub',
        ]);

        return response()->json([
            'message' => "Order #{$order->id} successfully dispatched via Steadfast Courier!",
            'consignment_id' => $consignmentId,
            'tracking_code' => $trackingCode,
            'order' => $order->fresh(['items', 'trackings']),
        ]);
    }

    /**
     * Check live courier tracking status
     */
    public function checkStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        if (empty($order->consignment_id)) {
            return response()->json([
                'message' => 'This order has not been dispatched to a courier yet.',
            ], 404);
        }

        return response()->json([
            'courier' => $order->courier_name,
            'consignment_id' => $order->consignment_id,
            'tracking_code' => $order->courier_tracking_code,
            'status' => $order->courier_status,
        ]);
    }
}
