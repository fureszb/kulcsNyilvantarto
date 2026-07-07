<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('vezenyles_areas', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('name')
                ->constrained('locations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('vezenyles_areas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('location_id');
        });
    }
};
