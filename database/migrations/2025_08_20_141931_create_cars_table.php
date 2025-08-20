<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/[timestamp]_create_cars_table.php
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('brand', 50)->comment('Merek mobil (e.g., Toyota)');
            $table->string('model', 50)->comment('Model mobil (e.g., Avanza)');
            $table->year('year')->comment('Tahun pembuatan');
            $table->string('license_plate', 15)->unique()->comment('Nomor polisi');
            $table->decimal('price_per_day', 10, 2);
            $table->text('description')->nullable();
            $table->json('features')->nullable()->comment('Fitur seperti GPS, Bluetooth dalam format JSON');
            $table->json('image_urls')->nullable()->comment('Daftar URL gambar mobil');
            $table->enum('status', ['available', 'rented', 'maintenance'])->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
