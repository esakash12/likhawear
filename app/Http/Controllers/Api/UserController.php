<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of staff users (admin, moderator, viewer).
     */
    public function index(Request $request)
    {
        // Only super-admin can manage staff users
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only super administrators can manage team users.',
            ], 403);
        }

        $users = User::whereIn('role', ['admin', 'moderator', 'viewer'])
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created staff user.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only super administrators can create team users.',
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => ['required', Rule::in(['admin', 'moderator', 'viewer'])],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => "Staff user \"{$user->name}\" created successfully with {$user->role} role.",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
        ], 201);
    }

    /**
     * Update an existing staff user's role or details.
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only super administrators can update team users.',
            ], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(['admin', 'moderator', 'viewer'])],
            'password' => 'nullable|min:6',
        ]);

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('role')) $user->role = $request->role;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => "User \"{$user->name}\" updated successfully.",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Remove the specified staff user.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only super administrators can delete team users.',
            ], 403);
        }

        if ((int)$request->user()->id === (int)$id) {
            return response()->json([
                'message' => 'You cannot delete your own admin account.',
            ], 422);
        }

        $user = User::findOrFail($id);
        $name = $user->name;
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => "User \"{$name}\" deleted successfully.",
        ]);
    }
}
