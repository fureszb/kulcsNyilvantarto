<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kilépés/felmondás dátuma a fluktuáció-számításhoz. A meglévő is_active
 * flag mellé: left_at kitöltve = a dolgozó kilépett (adott hónapban esett ki).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->table('users', function (Blueprint $table) {
            $table->date('left_at')->nullable()->after('employed_since');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('users', function (Blueprint $table) {
            $table->dropColumn('left_at');
        });
    }
};
