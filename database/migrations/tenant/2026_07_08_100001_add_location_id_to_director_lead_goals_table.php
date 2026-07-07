<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('director_lead_goals', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('lead_id')
                ->constrained('locations')->nullOnDelete();
        });

        Schema::connection('tenant')->table('director_lead_goals', function (Blueprint $table) {
            $table->dropUnique('goal_unique');
            $table->unique(
                ['director_id', 'lead_id', 'location_id', 'period_type', 'year', 'period'],
                'goal_unique_v2'
            );
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('director_lead_goals', function (Blueprint $table) {
            $table->dropUnique('goal_unique_v2');
            $table->unique(
                ['director_id', 'lead_id', 'period_type', 'year', 'period'],
                'goal_unique'
            );
        });

        Schema::connection('tenant')->table('director_lead_goals', function (Blueprint $table) {
            $table->dropConstrainedForeignId('location_id');
        });
    }
};
