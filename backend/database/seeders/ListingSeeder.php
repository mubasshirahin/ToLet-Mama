<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        $listings = [
            [
                'title' => 'Cozy Single Room in Banani',
                'price' => '8,500',
                'location' => 'Banani, Dhaka',
                'type' => 'Single Room',
                'status' => 'available',
                'description' => 'Furnished single room in a quiet residential area of Banani. Close to Banani DOHS and market.',
                'images' => [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Furnished', 'Near Metro', 'Quiet Area'],
                'specs' => ['1 Bed', '1 Bath', '120 sqft'],
                'amenities' => ['WiFi', 'AC', 'Parking', 'Security'],
                'rules' => ['No Smoking', 'No Pets', 'No Guests after 10 PM'],
                'nearby' => ['Banani Market', 'Khilgaon Flyover', 'Apollo Hospital'],
                'available_from' => '2026-09-01',
            ],
            [
                'title' => 'Modern Apartment in Dhanmondi',
                'price' => '22,000',
                'location' => 'Dhanmondi, Dhaka',
                'type' => 'Apartment',
                'status' => 'available',
                'description' => '2-bedroom apartment with modern finishing. Walking distance to Dhanmondi Lake.',
                'images' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Lake View', 'New Building', 'Lift'],
                'specs' => ['2 Bed', '2 Bath', '950 sqft'],
                'amenities' => ['WiFi', 'AC', 'Generator', 'Lift', 'Parking'],
                'rules' => ['No Smoking', 'No Loud Music'],
                'nearby' => ['Dhanmondi Lake', 'Jigatola Market', 'Shwapno'],
                'available_from' => '2026-09-15',
            ],
            [
                'title' => 'Shared Room for Students - Mirpur',
                'price' => '4,500',
                'location' => 'Mirpur 10, Dhaka',
                'type' => 'Shared Room',
                'status' => 'available',
                'description' => 'Shared room near Mirpur 10. Ideal for students and job holders. All utilities included.',
                'images' => [
                    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Utilities Included', 'Near Metro', 'Mess Facility'],
                'specs' => ['2 Beds', '1 Bath', '180 sqft'],
                'amenities' => ['WiFi', 'Fan', 'Mess'],
                'rules' => ['No Smoking', 'Mess Timing 8 PM'],
                'nearby' => ['Mirpur 10 Metro', 'Pallabi Market', 'Emergency Hospital'],
                'available_from' => '2026-08-28',
            ],
            [
                'title' => 'Luxury Studio in Gulshan',
                'price' => '35,000',
                'location' => 'Gulshan 2, Dhaka',
                'type' => 'Studio',
                'status' => 'available',
                'description' => 'Premium studio apartment in Gulshan 2 with city view. Fully furnished with high-end appliances.',
                'images' => [
                    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['City View', 'Fully Furnished', 'Premium Location'],
                'specs' => ['1 Bed', '1 Bath', '650 sqft'],
                'amenities' => ['WiFi', 'AC', 'Washing Machine', 'Microwave', 'Concierge', 'Gym'],
                'rules' => ['No Smoking', 'No Pets'],
                'nearby' => ['Gulshan 2 Circle', 'Jamuna Future Park', 'Mermaid Cafe'],
                'available_from' => '2026-10-01',
            ],
            [
                'title' => 'Family Flat in Uttara',
                'price' => '28,000',
                'location' => 'Uttara Sector 7, Dhaka',
                'type' => 'Flat',
                'status' => 'available',
                'description' => 'Spacious 3-bedroom flat perfect for families. Close to Uttara metro and markets.',
                'images' => [
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Family Friendly', 'Near Metro', 'Spacious'],
                'specs' => ['3 Bed', '2 Bath', '1400 sqft'],
                'amenities' => ['WiFi', 'AC', 'Generator', 'Lift', 'Parking', 'CCTV'],
                'rules' => ['No Smoking', 'No Pets', 'No Subletting'],
                'nearby' => ['Uttara Metro', 'Sector 7 Market', 'RAJLOKHI Hospital'],
                'available_from' => '2026-09-10',
            ],
            [
                'title' => 'Budget Room in Mohammadpur',
                'price' => '5,500',
                'location' => 'Mohammadpur, Dhaka',
                'type' => 'Single Room',
                'status' => 'available',
                'description' => 'Affordable room in Mohammadpur with basic amenities. Good for single working professionals.',
                'images' => [
                    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Affordable', 'Market Nearby', 'Bus Route'],
                'specs' => ['1 Bed', '1 Bath', '100 sqft'],
                'amenities' => ['Fan', 'Shared Kitchen', 'Water Filter'],
                'rules' => ['No Smoking', 'No Guests after 9 PM'],
                'nearby' => ['Mohammadpur Bus Stand', 'Star Kabab', 'Geneva Camp'],
                'available_from' => '2026-08-25',
            ],
            [
                'title' => 'New Apartment in Bashundhara R/A',
                'price' => '45,000',
                'location' => 'Bashundhara R/A Block C, Dhaka',
                'type' => 'Apartment',
                'status' => 'booked',
                'description' => 'Brand new 3-bedroom apartment in Bashundhara. Club facilities, 24/7 security.',
                'images' => [
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600566753376-24-666-6743?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Club Access', '24/7 Security', 'Brand New'],
                'specs' => ['3 Bed', '3 Bath', '1800 sqft'],
                'amenities' => ['WiFi', 'AC', 'Generator', 'Lift', 'Swimming Pool', 'Gym', 'Parking'],
                'rules' => ['No Smoking', 'No Pets', 'Visitors Must Register'],
                'nearby' => ['Bashundhara City Mall', 'Apollo Hospital', 'Jamuna Future Park'],
                'available_from' => '2026-10-15',
            ],
            [
                'title' => 'Flat Near University of Dhaka',
                'price' => '15,000',
                'location' => 'Nilkhet, Dhaka',
                'type' => 'Flat',
                'status' => 'available',
                'description' => '2-bedroom flat very close to Dhaka University campus. Great for students and faculty.',
                'images' => [
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Near DU Campus', 'Books Market', 'Historic Area'],
                'specs' => ['2 Bed', '1 Bath', '700 sqft'],
                'amenities' => ['WiFi', 'Fan', 'Shared Kitchen'],
                'rules' => ['No Smoking', 'No Loud Music'],
                'nearby' => ['Dhaka University', 'New Market', 'Curzon Hall'],
                'available_from' => '2026-09-01',
            ],
            [
                'title' => 'Shared Room - Tech Park Area',
                'price' => '6,000',
                'location' => 'Kaliakoir, Gazipur',
                'type' => 'Shared Room',
                'status' => 'available',
                'description' => 'Shared room near Hi-Tech Park. Perfect for IT professionals working in the area.',
                'images' => [
                    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Near Hi-Tech Park', 'IT Hub', 'Transport Available'],
                'specs' => ['2 Beds', '1 Bath', '160 sqft'],
                'amenities' => ['WiFi', 'AC', 'Mess', 'Laundry'],
                'rules' => ['No Smoking', 'Mess Hours Fixed'],
                'nearby' => ['Hi-Tech Park', 'Konabari Market', 'Bus Terminal'],
                'available_from' => '2026-09-05',
            ],
            [
                'title' => 'Studio Flat in Chattogram',
                'price' => '18,000',
                'location' => 'Agrabad, Chattogram',
                'type' => 'Studio',
                'status' => 'pending',
                'description' => 'Compact studio flat in Agrabad commercial area. Walking distance to port and business district.',
                'images' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
                ],
                'highlights' => ['Business District', 'Sea Breeze', 'Central Location'],
                'specs' => ['1 Bed', '1 Bath', '500 sqft'],
                'amenities' => ['WiFi', 'AC', 'Elevator', 'Parking'],
                'rules' => ['No Smoking', 'No Pets'],
                'nearby' => ['Agrabad CDA', 'Fishery Ghat', 'BRAC University'],
                'available_from' => '2026-10-01',
            ],
        ];

        foreach ($listings as $data) {
            Listing::create([...$data, 'user_id' => $user->id]);
        }
    }
}
