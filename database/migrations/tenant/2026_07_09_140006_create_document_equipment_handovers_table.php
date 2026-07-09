<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_equipment_handovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('equipment_name');
            $table->dateTime('issued_at');
            $table->string('issued_to_name');
            $table->string('issuer_security_service');
            $table->dateTime('returned_at')->nullable();
            $table->string('returned_by_name')->nullable();
            $table->string('receiver_security_service')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_equipment_handovers');
    }
};
