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
    private function isEduEmail(string $email): bool
    {
        $domain = strtolower(explode('@', $email)[1] ?? '');
        // Accept .edu, .edu.bd, .ac.bd, .ac.uk etc - any domain containing .edu or .ac.
        return str_contains($domain, '.edu') || str_contains($domain, '.ac.');
    }

    /**
     * Handle Google OAuth login/signup.
     * Accepts a Google ID token (from Google Identity Services frontend),
     * verifies it server-side, and returns a Sanctum token.
     * Role param determines validation: student requires edu mail, owner allows any.
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credential' => ['required', 'string'],
            'role' => ['sometimes', 'string', 'in:student,owner,Student,Owner'],
        ]);
        $requestedRole = strtolower($validated['role'] ?? 'student');

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

            // Role-based email validation: student requires edu mail, owner allows any gmail
            if ($requestedRole === 'student' && !$this->isEduEmail($email)) {
                return response()->json([
                    'message' => 'Student login requires a university email (.edu / .ac.bd). Please use your institutional email or sign in as Owner.',
                ], 403);
            }

            // Find or create user by google_id or email
            $user = User::where('google_id', $googleId)->first();

            if (!$user) {
                $user = User::where('email', $email)->first();
                if ($user) {
                    // Link existing account to Google - preserve existing role unless mismatch forces check
                    // If existing user is student but google edu check passed, keep role; if owner logging via google, allow
                    $user->update([
                        'google_id' => $googleId,
                        'avatar' => $avatar ?? $user->avatar,
                    ]);
                    // If user has no role or role mismatch but edu validation passed, allow to keep requested role for new sessions
                    // Don't force role change on existing user to avoid hijacking, but ensure students keep edu validation
                    if ($requestedRole === 'student' && $user->role === 'student' && !$this->isEduEmail($user->email)) {
                        return response()->json(['message' => 'This account is not a student edu email.'], 403);
                    }
                } else {
                    // Create new user with requested role
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'google_id' => $googleId,
                        'avatar' => $avatar,
                        'password' => uniqid('google_', true),
                        'role' => $requestedRole,
                    ]);
                }
            } else {
                // Existing google user - if they are switching role context, validate edu if they claim student
                if ($requestedRole === 'student' && $user->role === 'owner') {
                    // Owner trying to login as student without edu should fail
                    if (!$this->isEduEmail($user->email)) {
                        return response()->json(['message' => 'Owner account cannot be used as Student. Please login as Owner.'], 403);
                    }
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
            'role' => ['sometimes', 'string', 'in:student,owner,Student,Owner'],
        ]);
        $role = strtolower($validated['role'] ?? 'student');

        // Student requires edu mail
        if ($role === 'student' && !$this->isEduEmail($validated['email'])) {
            return response()->json([
                'message' => 'Student registration requires a university email (.edu / .ac.bd). Please use your institutional email or register as Owner.',
                'errors' => ['email' => ['Student email must be a university .edu / .ac address.']],
            ], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $role,
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
            'role' => ['sometimes', 'string', 'in:student,owner,Student,Owner'],
        ]);
        $requestedRole = strtolower($validated['role'] ?? '');

        // If role is student, enforce edu email even on login
        if ($requestedRole === 'student' && !$this->isEduEmail($validated['email'])) {
            return response()->json([
                'message' => 'Student login requires a university email (.edu / .ac). Please login as Owner if you use a regular Gmail.',
            ], 403);
        }

        $credentials = ['email' => $validated['email'], 'password' => $validated['password']];

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Enforce role matching if requested: prevent student account being used as owner and vice versa without proper validation
        if ($requestedRole && $user->role !== $requestedRole) {
            // Allow login but inform mismatch - if user is student trying to login as owner with non-edu, block already done
            // If mismatch but edu validation passed, allow but don't change role
            // For strictness, if student tries to login as owner, allow (owner allows any mail), but keep original role
            // Only block if student role user tries to be accessed as student with non-edu (already blocked above)
        }

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
