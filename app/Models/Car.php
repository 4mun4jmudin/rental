<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'brand',
        'model',
        'year',
        'license_plate',
        'price_per_day',
        'description',
        'features',
        'image_urls',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'features' => 'array',      // Otomatis konversi JSON -> Array dan sebaliknya
        'image_urls' => 'array',  // Otomatis konversi JSON -> Array dan sebaliknya
        'price_per_day' => 'decimal:2',
    ];

    /**
     * Relasi ke tabel reviews.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}