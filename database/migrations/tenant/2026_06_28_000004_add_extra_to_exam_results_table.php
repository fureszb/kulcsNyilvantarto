<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('exam_results', function (Blueprint $table) {
            $table->timestamp('started_at')->nullable()->after('completed_at');
            $table->unsignedInteger('tab_violations')->default(0)->after('started_at');
            $table->string('ip_address', 45)->nullable()->after('tab_violations');
            $table->unsignedInteger('time_taken_seconds')->nullable()->after('ip_address');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('exam_results', function (Blueprint $table) {
            $table->dropColumn(['started_at', 'tab_violations', 'ip_address', 'time_taken_seconds']);
        });
    }
};
