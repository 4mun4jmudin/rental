<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'car_id',
        'start_date',
        'end_date',
        'total_price',
        'status',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relasi: Pesanan (booking) dimiliki oleh satu pengguna (user)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: Pesanan (booking) terkait dengan satu mobil (car)
    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    // Relasi: Pesanan memiliki satu pembayaran (payment)
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    // Relasi: Pesanan memiliki satu ulasan (review)
    public function review()
    {
        return $this->hasOne(Review::class);
    }
}