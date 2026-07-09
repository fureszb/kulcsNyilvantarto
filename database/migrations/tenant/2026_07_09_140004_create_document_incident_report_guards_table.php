<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_incident_report_guards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_incident_report_id')->constrained('document_incident_reports')->cascadeOnDelete();
            $table->foreignId('tenant_user_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_incident_report_guards');
    }
};
