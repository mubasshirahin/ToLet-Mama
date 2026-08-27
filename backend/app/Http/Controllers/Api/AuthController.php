<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Handle Google OAuth login/signup.
     * Accepts a Google ID token (from Google Identity Services frontend),
     * verifies it server-side, and returns a Sanctum token.
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credential' => ['required', 'string'],
        ]);

        $googleClientId = config('services.google.client_id');

        if (!$googleClientId) {
            return response()->json(['message' => 'Google OAuth is not configured.'], 500);
        }

        // Verify the Google ID token by calling Google's tokeninfo endpoint
        try {
            $response = Http::withOptions([
                'verify' => false,
            ])->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $validated['credential'],
            ]);

            if ($response->failed()) {
                return response()->json(['message' => 'Invalid Google token.'], 401);
            }

            $googleUser = $response->json();

            // Verify the token is intended for our app
            if (($googleUser['aud'] ?? '') !== $googleClientId) {
                return response()->json(['message' => 'Token audience mismatch.'], 401);
            }

            // Check token expiry
            $expiresAt = (int) ($googleUser['exp'] ?? 0);
            if ($expiresAt < time()) {
                return response()->json(['message' => 'Google token has expired.'], 401);
            }

            $googleId = $googleUser['sub'];
            $email = $googleUser['email'] ?? '';
            $name = $googleUser['name'] ?? $email;
            $avatar = $googleUser['picture'] ?? null;

            // Only allow .edu email addresses
            $emailDomain = strtolower(explode('@', $email)[1] ?? '');
            if (!str_ends_with($emailDomain, '.edu')) {
                return response()->json([
                    'message' => 'Only .edu email addresses are allowed. Please sign in with your institutional email.',
                ], 403);
            }

            // Find or create user by google_id or email
            $user = User::where('google_id', $googleId)->first();

            if (!$user) {
                $user = User::where('email', $email)->first();
                if ($user) {
                    // Link existing account to Google
                    $user->update([
                        'google_id' => $googleId,
                        'avatar' => $avatar ?? $user->avatar,
                    ]);
                } else {
                    // Create new user
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'google_id' => $googleId,
                        'avatar' => $avatar,
                        'password' => uniqid('google_', true),
                    ]);
                }
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        } catch (ConnectionException $e) {
            return response()->json(['message' => 'Could not reach Google servers. Please check your internet connection and try again.'], 502);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Google authentication failed: ' . $e->getMessage()], 500);
        }
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
