<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\RoommateProfile;
use App\Notifications\MarketplaceNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MarketplaceExtrasController extends Controller
{
    public function notifications(Request $request): JsonResponse
    {
        return response()->json($request->user()->notifications()->latest()->limit(50)->get());
    }

    public function readNotification(Request $request, string $id): JsonResponse
    {
        $notice = $request->user()->notifications()->whereKey($id)->firstOrFail();
        $notice->markAsRead();
        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function unreadNotificationCount(Request $request): JsonResponse
    {
        return response()->json(['count' => $request->user()->unreadNotifications()->count()]);
    }

    public function appointments(Request $request): JsonResponse
    {
        return response()->json(\App\Models\ListingAppointment::with(['listing:id,title,location', 'student:id,name', 'owner:id,name'])
            ->where(fn ($q) => $q->where('student_id', $request->user()->id)->orWhere('owner_id', $request->user()->id))
            ->latest('requested_for')->get());
    }

    public function requestAppointment(Request $request, Listing $listing): JsonResponse
    {
        abort_unless($request->user()->role === 'student', 403, 'Only students can request a viewing.');
        abort_unless($listing->status === 'available' && $listing->user_id !== $request->user()->id, 422, 'This listing is not available for viewing.');
        $values = $request->validate(['requested_for' => ['required', 'date', 'after:now'], 'note' => ['nullable', 'string', 'max:1000']]);
        $appointment = \App\Models\ListingAppointment::create($values + ['listing_id' => $listing->id, 'student_id' => $request->user()->id, 'owner_id' => $listing->user_id]);
        $listing->user->notify(new MarketplaceNotice('Viewing request', $request->user()->name.' requested to view '.$listing->title, '/notifications'));
        return response()->json($appointment->load(['listing:id,title,location', 'student:id,name', 'owner:id,name']), 201);
    }

    public function updateAppointment(Request $request, int $id): JsonResponse
    {
        $appointment = \App\Models\ListingAppointment::findOrFail($id);
        abort_unless($appointment->owner_id === $request->user()->id, 403);
        $values = $request->validate(['status' => ['required', 'in:confirmed,declined,cancelled'], 'note' => ['nullable', 'string', 'max:1000']]);
        $appointment->update($values);
        \App\Models\User::find($appointment->student_id)?->notify(new MarketplaceNotice('Viewing request update', 'Your viewing request is '.$values['status'].'.', '/notifications'));
        return response()->json($appointment);
    }

    public function reportListing(Request $request, Listing $listing): JsonResponse
    {
        abort_if($listing->user_id === $request->user()->id, 422, 'You cannot report your own listing.');
        $values = $request->validate(['reason' => ['required', 'in:Incorrect information,Scam or fraud,Already rented,Inappropriate content,Other'], 'details' => ['nullable', 'string', 'max:2000']]);
        $report = \App\Models\ListingReport::updateOrCreate(['listing_id' => $listing->id, 'user_id' => $request->user()->id], $values + ['status' => 'open']);
        return response()->json(['message' => 'Report sent for review.', 'report' => $report], 201);
    }

    public function adminReports(Request $request): JsonResponse
    {
        $this->requireAdmin($request);
        return response()->json(\App\Models\ListingReport::with(['listing:id,title,location', 'user:id,name,email'])->latest()->paginate(30));
    }

    public function resolveReport(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin($request);
        $values = $request->validate(['status' => ['required', 'in:reviewed,dismissed,removed']]);
        $report = \App\Models\ListingReport::findOrFail($id);
        $report->update($values);
        if ($values['status'] === 'removed') $report->listing()->update(['status' => 'pending']);
        return response()->json($report);
    }

    public function saveRoommateProfile(Request $request): JsonResponse
    {
        $values = $request->validate([
            'preferred_location' => ['required', 'string', 'max:150'], 'max_rent' => ['required', 'integer', 'min:1', 'max:10000000'],
            'move_in_date' => ['nullable', 'string', 'max:50'], 'gender_preference' => ['nullable', 'in:any,male,female'],
            'preferences' => ['nullable', 'array', 'max:12'], 'preferences.*' => ['string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:1000'], 'is_active' => ['sometimes', 'boolean'],
        ]);
        $profile = RoommateProfile::updateOrCreate(['user_id' => $request->user()->id], $values);
        return response()->json($profile->load('user:id,name,avatar,city'));
    }

    public function getRoommateProfile(Request $request): JsonResponse
    {
        return response()->json($request->user()->roommateProfile()->first());
    }

    public function roommates(Request $request): JsonResponse
    {
        $filters = $request->validate(['location' => ['nullable', 'string', 'max:150'], 'max_rent' => ['nullable', 'integer', 'min:1'], 'gender_preference' => ['nullable', 'in:any,male,female']]);
        $profiles = RoommateProfile::with('user:id,name,avatar,city,role')->where('is_active', true)->where('user_id', '!=', $request->user()->id)
            ->when($filters['location'] ?? null, fn ($q, $v) => $q->where('preferred_location', 'like', '%'.$v.'%'))
            ->when($filters['max_rent'] ?? null, fn ($q, $v) => $q->where('max_rent', '<=', $v))
            ->when($filters['gender_preference'] ?? null, fn ($q, $v) => $q->whereIn('gender_preference', ['any', $v]))
            ->latest()->paginate(24);
        return response()->json($profiles);
    }

    public function saveSearch(Request $request): JsonResponse
    {
        $values = $request->validate(['name' => ['required', 'string', 'max:80'], 'filters' => ['required', 'array'], 'alerts_enabled' => ['sometimes', 'boolean']]);
        return response()->json($request->user()->savedSearches()->create($values), 201);
    }

    public function savedSearches(Request $request): JsonResponse
    {
        return response()->json($request->user()->savedSearches()->latest()->get());
    }

    public function deleteSearch(Request $request, int $id): JsonResponse
    {
        $request->user()->savedSearches()->whereKey($id)->delete();
        return response()->json(['message' => 'Saved search deleted.']);
    }

    public function submitVerification(Request $request): JsonResponse
    {
        $values = $request->validate(['document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'], 'phone' => ['nullable', 'string', 'max:30']]);
        $user = $request->user();
        if ($user->verification_document) Storage::disk('local')->delete($user->verification_document);
        $user->verification_document = $values['document']->store('private-verification');
        if (!empty($values['phone'])) $user->phone = $values['phone'];
        $user->verification_status = 'pending';
        $user->save();
        return response()->json(['verification_status' => $user->verification_status]);
    }

    public function verificationQueue(Request $request): JsonResponse
    {
        $this->requireAdmin($request);
        return response()->json(\App\Models\User::where('verification_status', 'pending')->paginate(30));
    }

    public function verificationDocument(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $user = \App\Models\User::findOrFail($id);
        abort_unless($user->verification_document && Storage::disk('local')->exists($user->verification_document), 404);
        return Storage::disk('local')->download($user->verification_document);
    }

    public function decideVerification(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin($request);
        $values = $request->validate(['status' => ['required', 'in:verified,rejected']]);
        $user = \App\Models\User::findOrFail($id);
        $user->update(['verification_status' => $values['status']]);
        $user->notify(new MarketplaceNotice('Verification update', 'Your account verification was '.$values['status'].'.', '/profile'));
        return response()->json(['verification_status' => $user->verification_status]);
    }

    private function requireAdmin(Request $request): void
    {
        abort_unless((bool) $request->user()->is_admin, 403, 'Administrator access required.');
    }
}
