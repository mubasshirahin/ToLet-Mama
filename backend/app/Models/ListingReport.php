<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingReport extends Model
{
    protected $fillable = ['listing_id', 'user_id', 'reason', 'details', 'status'];
    public function listing(): BelongsTo { return $this->belongsTo(Listing::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
