<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'is_secret',
        'description',
    ];

    protected $casts = [
        'is_secret' => 'boolean',
    ];

    /**
     * Accessor: when reading ->value, otomatis cast berdasarkan kolom `type`.
     * Jika is_secret = true, kita kembalikan masked value ('*****') untuk keamanan.
     */
    public function getValueAttribute($value)
    {
        // If secret, return masked placeholder by default
        if ($this->is_secret) {
            return $value ? '*****' : null;
        }

        // If null, return null
        if (is_null($value)) {
            return null;
        }

        // Cast by declared type
        switch ($this->type) {
            case 'json':
                $decoded = json_decode($value, true);
                return $decoded === null ? $value : $decoded;
            case 'boolean':
                return in_array($value, [1, '1', true, 'true'], true);
            case 'integer':
                return intval($value);
            case 'float':
                return floatval($value);
            default:
                return $value;
        }
    }

    /**
     * Mutator: when set value via model attribute, automatically encode if needed.
     * NOTE: encryption handled in controller when saving secrets; this mutator
     * tries to encode arrays to json if type is set.
     */
    public function setValueAttribute($value)
    {
        // If is_secret attribute is set on the model and true, we expect controller to encrypt.
        // Here we ensure arrays are JSON encoded, booleans normalized, otherwise store string.
        if (is_array($value)) {
            $this->attributes['value'] = json_encode($value);
            return;
        }

        if (is_bool($value)) {
            $this->attributes['value'] = $value ? '1' : '0';
            return;
        }

        $this->attributes['value'] = (string) $value;
    }
}
