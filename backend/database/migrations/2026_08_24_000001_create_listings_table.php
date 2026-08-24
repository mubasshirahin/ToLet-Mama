<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('price');
            $table->string('location');
            $table->string('type'); // Room, Apartment, Studio, Flat, Shared Room
            $table->enum('status', ['available', 'booked', 'pending'])->default('available');
            $table->text('description')->nullable();
            $table->json('images')->nullable();
            $table->json('highlights')->nullable();
            $table->json('specs')->nullable();
            $table->json('amenities')->nullable();
            $table->json('rules')->nullable();
            $table->json('nearby')->nullable();
            $table->date('available_from')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
