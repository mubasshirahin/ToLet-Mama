<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoritesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $savedIds = SavedListing::where('user_id', $request->user()->id)
            ->pluck('listing_id')
            ->toArray();

        return response()->json(['saved_ids' => $savedIds]);
    }

    public function toggle(Request $request, int $listingId): JsonResponse
    {
        $userId = $request->user()->id;

        $existing = SavedListing::where('user_id', $userId)
            ->where('listing_id', $listingId)
            ->first();

        if ($existing) {
            $existing->delete();
            $saved = false;
        } else {
            SavedListing::create([
                'user_id' => $userId,
                'listing_id' => $listingId,
            ]);
            $saved = true;
        }

        $count = SavedListing::where('user_id', $userId)->count();

        return response()->json([
            'saved' => $saved,
            'count' => $count,
        ]);
    }

    public function destroy(Request $request, int $listingId): JsonResponse
    {
        SavedListing::where('user_id', $request->user()->id)
            ->where('listing_id', $listingId)
            ->delete();

        $count = SavedListing::where('user_id', $request->user()->id)->count();

        return response()->json(['count' => $count]);
    }
}
