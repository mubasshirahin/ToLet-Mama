<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingView extends Model
{
    protected $fillable = [
        'listing_id',
        'user_id',
        'ip_address',
    ];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
