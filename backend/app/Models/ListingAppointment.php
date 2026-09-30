<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingAppointment extends Model
{
    protected $fillable = ['listing_id', 'student_id', 'owner_id', 'requested_for', 'status', 'note'];
    protected $casts = ['requested_for' => 'datetime'];
    public function listing(): BelongsTo { return $this->belongsTo(Listing::class); }
    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function owner(): BelongsTo { return $this->belongsTo(User::class, 'owner_id'); }
}
