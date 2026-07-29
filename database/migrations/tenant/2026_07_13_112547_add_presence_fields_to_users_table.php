<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('users', function (Blueprint $table) {
            $table->boolean('is_present')->default(false)->after('left_at');
            $table->timestamp('last_entry_at')->nullable()->after('is_present');
            $table->foreignId('last_entry_location_id')->nullable()->after('last_entry_at')
                ->constrained('locations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('last_entry_location_id');
            $table->dropColumn(['is_present', 'last_entry_at']);
        });
    }
};
