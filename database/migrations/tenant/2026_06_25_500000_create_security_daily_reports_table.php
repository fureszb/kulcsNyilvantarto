<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('security_daily_reports', function (Blueprint $table) {
            $table->id();
            $table->date('report_date');
            $table->json('service_members')->nullable();
            $table->json('equipment')->nullable();
            $table->json('inspectors')->nullable();
            $table->json('patrols')->nullable();
            $table->json('incidents')->nullable();
            $table->json('events')->nullable();
            $table->json('fire_alarms')->nullable();
            $table->json('elevators')->nullable();
            $table->json('maintenance')->nullable();
            $table->string('prepared_by')->nullable();
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('security_daily_reports');
    }
};
