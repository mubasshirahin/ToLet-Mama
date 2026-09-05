<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Increase sort buffer for large base64 image rows (622KB+ per listing)
        try { \DB::statement('SET SESSION sort_buffer_size = 67108864'); \DB::statement('SET SESSION read_rnd_buffer_size = 67108864'); } catch (\Throwable $e) {}
        $query = Listing::with('user');

        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $listings = $query->latest()->paginate(12);

        return response()->json($listings);
    }

    public function show(Listing $listing): JsonResponse
    {
        $listing->load('user');

        return response()->json($listing);
    }

    public function store(Request $request): JsonResponse
    {
        // Only owners can create listings
        if (($request->user()->role ?? 'student') !== 'owner') {
            return response()->json(['message' => 'Only owners can create listings. Please register as Owner.'], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'price' => ['required', 'string', 'max:50'],
            'location' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'gender' => ['sometimes', 'string', 'in:Male,Female,male,female'],
            'status' => ['sometimes', 'string', 'in:available,booked,pending'],
            'description' => ['sometimes', 'string'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['string'],
            'washroom_images' => ['sometimes', 'array'],
            'washroom_images.*' => ['string'],
            'balcony_images' => ['sometimes', 'array'],
            'balcony_images.*' => ['string'],
            'highlights' => ['sometimes', 'array'],
            'specs' => ['sometimes', 'array'],
            'amenities' => ['sometimes', 'array'],
            'rules' => ['sometimes', 'array'],
            'nearby' => ['sometimes', 'array'],
            'available_from' => ['sometimes', 'date'],
        ]);

        $listing = $request->user()->listings()->create($validated);
        // Clear draft after successful publish
        \App\Models\ListingDraft::where('user_id', $request->user()->id)->delete();

        return response()->json($listing, 201);
    }

    public function update(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'string', 'max:50'],
            'location' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'max:50'],
            'gender' => ['sometimes', 'string', 'in:Male,Female,male,female'],
            'status' => ['sometimes', 'string', 'in:available,booked,pending'],
            'description' => ['sometimes', 'string'],
            'images' => ['sometimes', 'array'],
            'washroom_images' => ['sometimes', 'array'],
            'balcony_images' => ['sometimes', 'array'],
            'highlights' => ['sometimes', 'array'],
            'specs' => ['sometimes', 'array'],
            'amenities' => ['sometimes', 'array'],
            'rules' => ['sometimes', 'array'],
            'nearby' => ['sometimes', 'array'],
            'available_from' => ['sometimes', 'date'],
        ]);

        $listing->update($validated);

        return response()->json($listing);
    }

    public function destroy(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $listing->delete();

        return response()->json(['message' => 'Listing deleted.']);
    }

    public function my(Request $request): JsonResponse
    {
        try { \DB::statement('SET SESSION sort_buffer_size = 67108864'); \DB::statement('SET SESSION read_rnd_buffer_size = 67108864'); } catch (\Throwable $e) {}
        $listings = $request->user()->listings()->latest()->paginate(12);

        return response()->json($listings);
    }

    // Draft — server-side persistence for Add Listing (no localStorage)
    public function getDraft(Request $request): JsonResponse
    {
        $draft = \App\Models\ListingDraft::where('user_id', $request->user()->id)->first();
        return response()->json($draft?->data ?? null);
    }

    public function saveDraft(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'data' => ['required', 'array'],
        ]);
        $draft = \App\Models\ListingDraft::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['data' => $validated['data']]
        );
        return response()->json(['message' => 'Draft saved', 'data' => $draft->data]);
    }

    public function deleteDraft(Request $request): JsonResponse
    {
        \App\Models\ListingDraft::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Draft deleted']);
    }

    public function interested(Request $request, Listing $listing): JsonResponse
    {
        // Only owner of listing can see who is interested
        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Users who saved/favorited this listing
        $savedUserIds = \DB::table('saved_listings')->where('listing_id', $listing->id)->pluck('user_id');

        // Users who messaged about this listing (or messaged the owner at all - correlate via listing_id)
        $messagedUserIds = \App\Models\Message::where('listing_id', $listing->id)->pluck('sender_id')
            ->merge(\App\Models\Message::where('listing_id', $listing->id)->pluck('receiver_id'));

        // Users who viewed
        $viewedUserIds = \App\Models\ListingView::where('listing_id', $listing->id)->whereNotNull('user_id')->pluck('user_id');

        $allIds = $savedUserIds->merge($messagedUserIds)->merge($viewedUserIds)->unique()->filter(fn($id) => $id !== $request->user()->id);

        $users = \App\Models\User::whereIn('id', $allIds)->get(['id','name','email','avatar','role'])->map(function($u) use ($listing) {
            $isSaved = \DB::table('saved_listings')->where('listing_id', $listing->id)->where('user_id', $u->id)->exists();
            $msgCount = \App\Models\Message::where('listing_id', $listing->id)->where(function($q) use ($u){ $q->where('sender_id',$u->id)->orWhere('receiver_id',$u->id); })->count();
            $viewCount = \App\Models\ListingView::where('listing_id', $listing->id)->where('user_id', $u->id)->count();
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'avatar' => $u->avatar,
                'role' => $u->role ?? 'student',
                'saved' => $isSaved,
                'messages' => $msgCount,
                'views' => $viewCount,
            ];
        });

        return response()->json($users);
    }
}
