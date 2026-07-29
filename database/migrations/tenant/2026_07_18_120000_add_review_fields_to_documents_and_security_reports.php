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
        Schema::table('documents', function (Blueprint $table) {
            // Valódi lezárási/jóváhagyási munkafolyamat — korábban a `status='draft'` volt az
            // egyetlen (pontatlan) "nyitva van" jelzés a dashboardokon; ez a mező konkrétan azt
            // rögzíti, hogy egy vezető (Területi igazgató/Biztonsági vezető/PM/admin) átnézte-e
            // a rendellenességet rögzítő dokumentumot.
            $table->timestamp('reviewed_at')->nullable()->after('finalized_at');
            $table->foreignId('reviewed_by_user_id')->nullable()->after('reviewed_at')
                ->constrained('users')->nullOnDelete();
        });

        Schema::table('security_daily_reports', function (Blueprint $table) {
            $table->timestamp('reviewed_at')->nullable()->after('created_by_user_id');
            $table->foreignId('reviewed_by_user_id')->nullable()->after('reviewed_at')
                ->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by_user_id');
            $table->dropColumn('reviewed_at');
        });

        Schema::table('security_daily_reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by_user_id');
            $table->dropColumn('reviewed_at');
        });
    }
};
