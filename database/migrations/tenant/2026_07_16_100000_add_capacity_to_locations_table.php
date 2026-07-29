<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            // Élő létszám / kapacitás widget mobilon (Kezdőlap "Élő adatok") — nullable, mert
            // régi helyszíneknél nincs megadva; ilyenkor a kliens nem mutatja a kapacitás-hányadost.
            $table->unsignedInteger('capacity')->nullable()->after('polygon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('capacity');
        });
    }
};
