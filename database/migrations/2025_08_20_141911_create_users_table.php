<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // database/migrations/[timestamp]_create_users_table.php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('full_name', 100);
        $table->string('email', 100)->unique();
        $table->string('password');
        $table->string('phone_number', 20)->nullable();
        $table->text('address')->nullable();
        $table->enum('role', ['penyewa', 'kasir', 'pemilik_rental', 'admin'])->default('penyewa');
        $table->timestamp('email_verified_at')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
