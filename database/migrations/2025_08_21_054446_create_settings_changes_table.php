<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings_changes', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key');
            $table->longText('old_value')->nullable();
            $table->longText('new_value')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('setting_key');
            $table->index('changed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings_changes');
    }
};
