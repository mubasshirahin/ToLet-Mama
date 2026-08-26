<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ListingView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingViewController extends Controller
{
    public function record(Request $request, int $listingId): JsonResponse
    {
        ListingView::create([
            'listing_id' => $listingId,
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'View recorded.']);
    }

    public function monthlyCount(Request $request, int $listingId): JsonResponse
    {
        $count = ListingView::where('listing_id', $listingId)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        return response()->json(['count' => $count]);
    }
}
