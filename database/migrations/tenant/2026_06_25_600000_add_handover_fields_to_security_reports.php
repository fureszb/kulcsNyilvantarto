<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('security_daily_reports', function (Blueprint $table) {
            $table->json('previous_shift_members')->nullable()->after('service_members');
            $table->string('taken_over_from', 255)->nullable()->after('previous_shift_members');
            $table->string('handover_time', 5)->nullable()->after('taken_over_from');
            $table->json('cc_recipients')->nullable()->after('handover_time');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('security_daily_reports', function (Blueprint $table) {
            $table->dropColumn(['previous_shift_members', 'taken_over_from', 'handover_time', 'cc_recipients']);
        });
    }
};
