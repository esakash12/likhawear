<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsContent;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function index()
    {
        $records = CmsContent::all()->pluck('value', 'key')->toArray();
        return response()->json($records);
    }

    public function update(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $existing = CmsContent::where('key', $key)->first();
                if ($existing && is_array($existing->value)) {
                    $value = array_merge($existing->value, $value);
                }
            }

            CmsContent::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        $records = CmsContent::all()->pluck('value', 'key')->toArray();
        return response()->json($records);
    }
}
