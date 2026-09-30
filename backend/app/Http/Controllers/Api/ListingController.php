<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingView;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Increase sort buffer for large base64 image rows (622KB+ per listing)
        try { \DB::statement('SET SESSION sort_buffer_size = 67108864'); \DB::statement('SET SESSION read_rnd_buffer_size = 67108864'); } catch (\Throwable $e) {}
        $query = Listing::with('user')->whereIn('status', ['available', 'booked']);

        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->has('status')) {
            $validatedStatus = $request->validate(['status' => ['string', 'in:available,booked,pending']])['status'];
            if ($validatedStatus === 'pending') {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('status', $validatedStatus);
            }
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
        $viewer = auth('sanctum')->user();
        if ($listing->status === 'pending' && (!$viewer || $viewer->id !== $listing->user_id)) {
            abort(404);
        }
        $listing->load('user');

        return response()->json($listing);
    }

    public function store(Request $request): JsonResponse
    {
        // Only owners can create listings
        if (($request->user()->role ?? 'student') !== 'owner') {
            return response()->json(['message' => 'Only owners can create listings. Please register as Owner.'], 403);
        }

        $this->decodeStructuredFields($request);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'price' => ['required', 'string', 'max:50'],
            'location' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'gender' => ['sometimes', 'string', 'in:Male,Female,male,female'],
            'status' => ['sometimes', 'string', 'in:available,booked,pending'],
            'description' => ['sometimes', 'string'],
            'images' => ['sometimes', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'existing_images' => ['sometimes', 'array', 'max:5'],
            'existing_images.*' => ['string', 'max:2048'],
            'images_present' => ['sometimes', 'boolean'],
            'washroom_images' => ['sometimes', 'array', 'max:5'],
            'washroom_images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'existing_washroom_images' => ['sometimes', 'array', 'max:5'],
            'existing_washroom_images.*' => ['string', 'max:2048'],
            'washroom_images_present' => ['sometimes', 'boolean'],
            'balcony_images' => ['sometimes', 'array', 'max:5'],
            'balcony_images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'existing_balcony_images' => ['sometimes', 'array', 'max:5'],
            'existing_balcony_images.*' => ['string', 'max:2048'],
            'balcony_images_present' => ['sometimes', 'boolean'],
            'highlights' => ['sometimes', 'array'],
            'specs' => ['sometimes', 'array'],
            'amenities' => ['sometimes', 'array'],
            'rules' => ['sometimes', 'array'],
            'nearby' => ['sometimes', 'array'],
            'available_from' => ['sometimes', 'nullable', 'date'],
        ]);

        $this->validatePhotoLimit($request);
        $validated = $this->applyPhotoFields($request, $validated, false);

        $listing = $request->user()->listings()->create($validated);
        $price = (int) preg_replace('/[^0-9]/', '', $listing->price);
        \App\Models\SavedSearch::where('alerts_enabled', true)->with('user')->get()->each(function ($saved) use ($listing, $price) {
            $filters = $saved->filters ?? [];
            $term = trim((string) ($filters['search'] ?? ''));
            $limit = (int) ($filters['max_price'] ?? 0);
            $matchesLocation = !$term || str_contains(mb_strtolower($listing->location.' '.$listing->title), mb_strtolower($term));
            if ($matchesLocation && (!$limit || $price <= $limit)) {
                $saved->user?->notify(new \App\Notifications\MarketplaceNotice('New listing matches your search', $listing->title.' in '.$listing->location, '/listings/'.$listing->id));
            }
        });
        // Clear draft after successful publish
        \App\Models\ListingDraft::where('user_id', $request->user()->id)->delete();

        return response()->json($listing, 201);
    }

    public function update(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $this->decodeStructuredFields($request);
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'string', 'max:50'],
            'location' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'max:50'],
            'gender' => ['sometimes', 'string', 'in:Male,Female,male,female'],
            'status' => ['sometimes', 'string', 'in:available,booked,pending'],
            'description' => ['sometimes', 'string'],
            'images' => ['sometimes', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'existing_images' => ['sometimes', 'array', 'max:5'],
            'existing_images.*' => ['string', 'max:2048'],
            'images_present' => ['sometimes', 'boolean'],
            'washroom_images' => ['sometimes', 'array', 'max:5'],
            'washroom_images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'existing_washroom_images' => ['sometimes', 'array', 'max:5'],
            'existing_washroom_images.*' => ['string', 'max:2048'],
            'washroom_images_present' => ['sometimes', 'boolean'],
            'balcony_images' => ['sometimes', 'array', 'max:5'],
            'balcony_images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'existing_balcony_images' => ['sometimes', 'array', 'max:5'],
            'existing_balcony_images.*' => ['string', 'max:2048'],
            'balcony_images_present' => ['sometimes', 'boolean'],
            'highlights' => ['sometimes', 'array'],
            'specs' => ['sometimes', 'array'],
            'amenities' => ['sometimes', 'array'],
            'rules' => ['sometimes', 'array'],
            'nearby' => ['sometimes', 'array'],
            'available_from' => ['sometimes', 'nullable', 'date'],
        ]);

        $this->validatePhotoLimit($request);
        $validated = $this->applyPhotoFields($request, $validated, true);

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
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'status' => ['sometimes', 'nullable', 'string', 'in:available,booked,pending'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);
        $query = $request->user()->listings()->latest();
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($builder) => $builder
                ->where('title', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%"));
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        $listings = $query->paginate(12);

        return response()->json($listings);
    }

    public function myAnalytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $listings = $user->listings()->withCount(['views', 'savedByUsers'])->get(['id']);
        $listingIds = $listings->pluck('id');
        $monthlyViews = ListingView::query()
            ->selectRaw('listing_id, COUNT(*) as aggregate')
            ->whereIn('listing_id', $listingIds)
            ->where('created_at', '>=', now()->startOfMonth())
            ->groupBy('listing_id')
            ->pluck('aggregate', 'listing_id');
        $inquiries = Message::query()
            ->selectRaw('listing_id, COUNT(DISTINCT sender_id) as aggregate')
            ->where('receiver_id', $user->id)
            ->whereIn('listing_id', $listingIds)
            ->groupBy('listing_id')
            ->pluck('aggregate', 'listing_id');

        return response()->json($listings->mapWithKeys(fn ($listing) => [
            $listing->id => [
                'views_total' => $listing->views_count,
                'views_this_month' => (int) ($monthlyViews[$listing->id] ?? 0),
                'saved_count' => $listing->saved_by_users_count,
                'inquiries_count' => (int) ($inquiries[$listing->id] ?? 0),
            ],
        ]));
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

        // Only students who explicitly contacted the owner appear here. Passive views
        // and bookmarks are private and are shown only as aggregate analytics.
        $users = Message::query()
            ->where('listing_id', $listing->id)
            ->where('receiver_id', $listing->user_id)
            ->with('sender:id,name,avatar,role')
            ->get()
            ->groupBy('sender_id')
            ->map(fn ($messages) => [
                'id' => $messages->first()->sender->id,
                'name' => $messages->first()->sender->name,
                'avatar' => $messages->first()->sender->avatar,
                'role' => $messages->first()->sender->role ?? 'student',
                'messages' => $messages->count(),
            ])->values();

        return response()->json($users);
    }

    private function decodeStructuredFields(Request $request): void
    {
        foreach (['highlights', 'specs', 'amenities', 'rules', 'nearby'] as $field) {
            $json = $request->input($field.'_json');
            if ($json === null) continue;
            $decoded = json_decode($json, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw ValidationException::withMessages([$field => ['Invalid listing data.']]);
            }
            $request->merge([$field => $decoded]);
        }
    }

    private function validatePhotoLimit(Request $request): void
    {
        $count = 0;
        foreach (['images', 'washroom_images', 'balcony_images'] as $field) {
            $count += count($request->file($field, []));
            $count += count($request->input('existing_'.$field, []));
        }
        if ($count > 5) {
            throw ValidationException::withMessages(['images' => ['A listing can have up to 5 photos total.']]);
        }
    }

    private function applyPhotoFields(Request $request, array $validated, bool $updating): array
    {
        foreach (['images', 'washroom_images', 'balcony_images'] as $field) {
            if (!$updating || $request->boolean($field.'_present')) {
                $urls = array_values($request->input('existing_'.$field, []));
                foreach ($request->file($field, []) as $file) {
                    $path = $file->store('listings', 'public');
                    $urls[] = Storage::disk('public')->url($path);
                }
                $validated[$field] = $urls;
            }
            unset($validated['existing_'.$field], $validated[$field.'_present']);
        }
        return $validated;
    }
}
