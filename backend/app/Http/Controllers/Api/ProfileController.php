<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'city' => $user->city ?? '',
            'bio' => $user->bio ?? '',
            'avatar' => $user->avatar ?? '',
            'created_at' => $user->created_at,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', 'min:2'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:500'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'city' => $user->city ?? '',
                'bio' => $user->bio ?? '',
                'avatar' => $user->avatar ?? '',
                'created_at' => $user->created_at,
            ],
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', Password::min(6)],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => $validated['new_password'],
        ]);

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }
}
