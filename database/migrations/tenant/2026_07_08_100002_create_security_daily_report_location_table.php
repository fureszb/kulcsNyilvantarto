<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('security_daily_report_location', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('security_daily_reports')->cascadeOnDelete();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->unique(['report_id', 'location_id']);
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('security_daily_report_location');
    }
};
