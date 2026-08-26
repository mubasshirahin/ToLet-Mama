<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ListingView;
use App\Models\Message;
use App\Models\SavedListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalListings = $user->listings()->count();

        // Count distinct users the current user has messaged with
        $activeChats = (int) Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->selectRaw('COUNT(DISTINCT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END) as cnt', [$user->id])
            ->value('cnt');

        $savedProperties = SavedListing::where('user_id', $user->id)->count();

        $monthlyVisits = ListingView::whereHas('listing', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        return response()->json([
            'total_listings' => $totalListings,
            'active_chats' => $activeChats,
            'saved_properties' => $savedProperties,
            'monthly_visits' => $monthlyVisits,
        ]);
    }
}
