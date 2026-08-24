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
        $query = Listing::with('user');

        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
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
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'price' => ['required', 'string', 'max:50'],
            'location' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'status' => ['sometimes', 'string', 'in:available,booked,pending'],
            'description' => ['sometimes', 'string'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['string'],
            'highlights' => ['sometimes', 'array'],
            'specs' => ['sometimes', 'array'],
            'amenities' => ['sometimes', 'array'],
            'rules' => ['sometimes', 'array'],
            'nearby' => ['sometimes', 'array'],
            'available_from' => ['sometimes', 'date'],
        ]);

        $listing = $request->user()->listings()->create($validated);

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
            'status' => ['sometimes', 'string', 'in:available,booked,pending'],
            'description' => ['sometimes', 'string'],
            'images' => ['sometimes', 'array'],
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
        $listings = $request->user()->listings()->latest()->paginate(12);

        return response()->json($listings);
    }
}
