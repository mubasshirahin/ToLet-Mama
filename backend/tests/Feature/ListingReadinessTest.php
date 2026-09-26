<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ListingReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_browse_hides_pending_listings_and_serves_available_ones(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $owner->listings()->create(['title' => 'Visible room', 'price' => '8000', 'location' => 'Banani', 'type' => 'Single Room', 'status' => 'available']);
        $pending = $owner->listings()->create(['title' => 'Pending room', 'price' => '9000', 'location' => 'Uttara', 'type' => 'Single Room', 'status' => 'pending']);

        $this->getJson('/api/listings')->assertOk()->assertJsonFragment(['title' => 'Visible room'])->assertJsonMissing(['title' => 'Pending room']);
        $this->getJson('/api/listings/'.$pending->id)->assertNotFound();
    }

    public function test_owner_can_upload_and_retain_listing_photos_as_storage_urls(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'owner']);

        $response = $this->actingAs($owner)->post('/api/listings', [
            'title' => 'Photo room', 'price' => '12000', 'location' => 'Dhanmondi', 'type' => 'Studio',
            'images' => [UploadedFile::fake()->image('room.jpg')],
            'highlights_json' => json_encode(['Furnished']),
            'specs_json' => json_encode(['bedrooms' => 1]),
            'amenities_json' => json_encode(['Wi-Fi']),
            'rules_json' => json_encode([]),
            'nearby_json' => json_encode([]),
        ], ['Accept' => 'application/json']);

        $response->assertCreated()->assertJsonPath('title', 'Photo room');
        $imageUrl = $response->json('images.0');
        $this->assertStringContainsString('/storage/listings/', $imageUrl);
        $path = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
        Storage::disk('public')->assertExists($path);
    }

    public function test_owner_listing_search_and_analytics_are_scoped_to_the_owner(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $other = User::factory()->create(['role' => 'owner']);
        $owner->listings()->create(['title' => 'Banani studio', 'price' => '10000', 'location' => 'Banani', 'type' => 'Studio', 'status' => 'available']);
        $other->listings()->create(['title' => 'Hidden other listing', 'price' => '10000', 'location' => 'Uttara', 'type' => 'Studio', 'status' => 'available']);

        $this->actingAs($owner)->getJson('/api/my/listings?search=Banani')->assertOk()->assertJsonPath('total', 1)->assertJsonFragment(['title' => 'Banani studio']);
        $this->actingAs($owner)->getJson('/api/my/listings/analytics')->assertOk()->assertJsonCount(1);
    }
}
