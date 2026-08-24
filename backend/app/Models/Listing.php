<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'price',
        'location',
        'type',
        'status',
        'description',
        'images',
        'highlights',
        'specs',
        'amenities',
        'rules',
        'nearby',
        'available_from',
    ];

    protected $casts = [
        'images' => 'array',
        'highlights' => 'array',
        'specs' => 'array',
        'amenities' => 'array',
        'rules' => 'array',
        'nearby' => 'array',
        'available_from' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
