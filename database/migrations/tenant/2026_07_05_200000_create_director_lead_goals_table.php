<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('director_lead_goals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('director_id');
            $table->unsignedBigInteger('lead_id');
            $table->enum('period_type', ['monthly', 'quarterly'])->default('monthly');
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('period'); // hónap: 1-12 / negyedév: 1-4
            $table->decimal('target_completion_pct', 5, 2)->default(80.00);
            $table->decimal('target_turnover_pct', 5, 2)->default(5.00);
            $table->timestamps();
            $table->unique(['director_id', 'lead_id', 'period_type', 'year', 'period'], 'goal_unique');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('director_lead_goals');
    }
};
