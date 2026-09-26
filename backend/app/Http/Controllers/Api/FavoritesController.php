<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\SavedListing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoritesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $listings = $request->user()->savedListings()
            ->with('user')
            ->orderBy('saved_listings.created_at', 'desc')
            ->get();

        return response()->json([
            'saved_ids' => $listings->pluck('id')->values(),
            'listings' => $listings,
            'count' => $listings->count(),
        ]);
    }

    /**
     * Toggle endpoint retained for existing clients.
     */
    public function toggle(Request $request, int $listingId): JsonResponse
    {
        $userId = $request->user()->id;
        $listing = Listing::findOrFail($listingId);

        $saved = DB::transaction(function () use ($userId, $listing): bool {
            User::whereKey($userId)->lockForUpdate()->firstOrFail();

            $favorite = SavedListing::where('user_id', $userId)
                ->where('listing_id', $listing->id)
                ->first();

            if ($favorite) {
                $favorite->delete();
                return false;
            }

            SavedListing::create([
                'user_id' => $userId,
                'listing_id' => $listing->id,
            ]);

            return true;
        });

        return response()->json([
            'saved' => $saved,
            'count' => SavedListing::where('user_id', $userId)->count(),
        ]);
    }

    public function store(Request $request, int $listingId): JsonResponse
    {
        $listing = Listing::findOrFail($listingId);
        $userId = $request->user()->id;

        DB::transaction(function () use ($userId, $listing): void {
            User::whereKey($userId)->lockForUpdate()->firstOrFail();

            SavedListing::firstOrCreate([
                'user_id' => $userId,
                'listing_id' => $listing->id,
            ]);
        });

        return response()->json([
            'saved' => true,
            'count' => SavedListing::where('user_id', $userId)->count(),
        ]);
    }

    public function destroy(Request $request, int $listingId): JsonResponse
    {
        $userId = $request->user()->id;

        DB::transaction(function () use ($userId, $listingId): void {
            User::whereKey($userId)->lockForUpdate()->firstOrFail();

            SavedListing::where('user_id', $userId)
                ->where('listing_id', $listingId)
                ->delete();
        });

        return response()->json([
            'saved' => false,
            'count' => SavedListing::where('user_id', $userId)->count(),
        ]);
    }
}
