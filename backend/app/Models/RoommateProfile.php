<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoommateProfile extends Model
{
    protected $fillable = ['user_id', 'preferred_location', 'max_rent', 'move_in_date', 'gender_preference', 'preferences', 'bio', 'is_active'];
    protected $casts = ['preferences' => 'array', 'is_active' => 'boolean'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
