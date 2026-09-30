<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedSearch extends Model
{
    protected $fillable = ['user_id', 'name', 'filters', 'alerts_enabled'];
    protected $casts = ['filters' => 'array', 'alerts_enabled' => 'boolean'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
