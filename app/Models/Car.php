<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
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
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'features' => 'array',
        'image_urls' => 'array',
    ];

    // Relasi: Mobil memiliki banyak pesanan (bookings)
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    // Relasi: Mobil memiliki banyak ulasan (reviews)
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}