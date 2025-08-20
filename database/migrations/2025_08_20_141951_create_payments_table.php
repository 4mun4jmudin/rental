<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/[timestamp]_create_payments_table.php
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->unique()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 50);
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->string('transaction_id', 100)->nullable()->comment('ID dari payment gateway');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
