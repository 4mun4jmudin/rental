<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'user_id',
        'car_id',
        'rating',
        'comment',
    ];

    // Relasi: Ulasan (review) terkait dengan satu pesanan (booking)
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    // Relasi: Ulasan (review) terkait dengan satu pengguna (user)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: Ulasan (review) terkait dengan satu mobil (car)
    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}