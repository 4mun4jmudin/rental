<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('type')->default('string')->after('value');
            $table->string('group')->nullable()->after('type');
            $table->boolean('is_secret')->default(false)->after('group');
            $table->text('description')->nullable()->after('is_secret');

            // optional: index for fast lookup
            $table->index('group');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropIndex(['group']);
            $table->dropColumn(['type', 'group', 'is_secret', 'description']);
        });
    }
};
