<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kétszintű hozzárendelés a szervezeti hierarchiához:
 *  - location_user:    worker ↔ irodaház (ki melyik házban dolgozik)
 *  - location_manager: biztonsági vezető ↔ irodaház (vezető mely házakért felel)
 *  - director_lead:    területi igazgató ↔ biztonsági vezető (igazgató mely vezetőket felügyeli)
 *
 * Az igazgató a vezetőin keresztül látja az irodaházakat:
 *   director → director_lead → security_lead → location_manager → location → location_user → worker
 */
return new class extends Migration
{
    public function up(): void
    {
        // Worker ↔ irodaház
        Schema::connection('tenant')->create('location_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            $table->unique(['location_id', 'user_id']);
            $table->index('user_id');
        });

        // Biztonsági vezető ↔ irodaház
        Schema::connection('tenant')->create('location_manager', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->unsignedBigInteger('manager_id'); // TenantUser (security_lead)
            $table->timestamps();
            $table->unique(['location_id', 'manager_id']);
            $table->index('manager_id');
        });

        // Területi igazgató ↔ biztonsági vezető
        Schema::connection('tenant')->create('director_lead', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('director_id'); // TenantUser (area_director)
            $table->unsignedBigInteger('lead_id');     // TenantUser (security_lead)
            $table->timestamps();
            $table->unique(['director_id', 'lead_id']);
            $table->index('director_id');
            $table->index('lead_id');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('director_lead');
        Schema::connection('tenant')->dropIfExists('location_manager');
        Schema::connection('tenant')->dropIfExists('location_user');
    }
};
