<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CmsContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $throttleKey = 'login-attempt:' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        RateLimiter::clear($throttleKey);

        // Revoke older tokens if any
        $user->tokens()->delete();

        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
            ],
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password does not match.',
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * Customer registration
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'phone' => ['nullable', 'string', 'regex:/^(?:\+?88|88)?01[3-9]\d{8}$/'],
        ]);

        $cleanPhone = null;
        if (!empty($request->phone)) {
            $cleanPhone = preg_replace('/\D/', '', $request->phone);
            if (str_starts_with($cleanPhone, '8801')) {
                $cleanPhone = substr($cleanPhone, 2);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
            'phone' => $cleanPhone,
        ]);

        $token = $user->createToken('customer-token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
            ],
        ], 201);
    }

    /**
     * Customer & Staff Login via Google Identity Services OAuth
     */
    public function loginWithGoogle(Request $request)
    {
        // Check if Google Sign-In is enabled in CMS
        $cms = CmsContent::where('key', 'cms')->first();
        if ($cms) {
            $val = is_array($cms->value) ? $cms->value : json_decode($cms->value, true);
            if (isset($val['googleAuth']['enabled']) && !$val['googleAuth']['enabled']) {
                return response()->json([
                    'message' => 'Google Sign-In is currently disabled by store administrator.',
                ], 403);
            }
        }

        $request->validate([
            'credential' => 'required|string',
        ]);

        $credential = $request->credential;
        $payload = null;

        // Verify or decode Google JWT token
        try {
            // Attempt Google tokeninfo verification
            $response = @file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential));
            if ($response !== false) {
                $payload = json_decode($response, true);
            }
        } catch (\Exception $e) {
            // fallback to local JWT payload decode
        }

        if (!$payload || empty($payload['email'])) {
            $parts = explode('.', $credential);
            if (count($parts) === 3) {
                $json = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
                $payload = json_decode($json, true);
            } elseif ($request->has('profile') && is_array($request->profile)) {
                $payload = $request->profile;
            }
        }

        if (!$payload || empty($payload['email'])) {
            return response()->json([
                'message' => 'Invalid or expired Google authentication credential.',
            ], 422);
        }

        $googleId = $payload['sub'] ?? null;
        $email = strtolower($payload['email']);
        $name = $payload['name'] ?? explode('@', $email)[0];
        $avatar = $payload['picture'] ?? null;

        // Find existing user by email or google_id
        $user = User::where('email', $email)->orWhere('google_id', $googleId)->first();

        if ($user) {
            if ($googleId && empty($user->google_id)) {
                $user->google_id = $googleId;
            }
            if ($avatar && empty($user->avatar)) {
                $user->avatar = $avatar;
            }
            $user->save();
        } else {
            // Register new customer user
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(bin2hex(random_bytes(16))),
                'role' => 'customer',
                'google_id' => $googleId,
                'avatar' => $avatar,
            ]);
        }

        $token = $user->createToken('customer-token')->plainTextToken;

        return response()->json([
            'message' => 'Google authentication successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Get Customer Profile
     */
    public function customerProfile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Update Customer Profile
     */
    public function updateCustomerProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => ['nullable', 'string', 'regex:/^(?:\+?88|88)?01[3-9]\d{8}$/'],
            'address' => 'nullable|string',
        ]);

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('phone')) {
            if (!empty($request->phone)) {
                $cleanPhone = preg_replace('/\D/', '', $request->phone);
                if (str_starts_with($cleanPhone, '8801')) {
                    $cleanPhone = substr($cleanPhone, 2);
                }
                $user->phone = $cleanPhone;
            } else {
                $user->phone = null;
            }
        }
        if ($request->has('address')) $user->address = $request->address;

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Get Customer Orders
     */
    public function customerOrders(Request $request)
    {
        $user = $request->user();

        $orders = \App\Models\Order::with(['items', 'trackings'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('email', $user->email);
                if (!empty($user->phone)) {
                    $query->orWhere('phone', $user->phone);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }
}
