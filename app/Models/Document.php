<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'file_path',
        'status',
        'rejection_reason',
    ];

    /**
     * Mendefinisikan relasi "belongsTo" ke model User.
     * Setiap dokumen dimiliki oleh satu pengguna.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}