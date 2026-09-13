<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check if user is a viewer trying to make modifications
        if ($user->role === 'viewer' && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return response()->json([
                'message' => 'Permission Denied: Viewer accounts have read-only access. You cannot perform modifications.',
            ], 403);
        }

        // If specific roles are required (e.g. role:admin)
        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized: Your role does not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
