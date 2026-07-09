<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_key_card_handovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('key_card_number_or_name');
            $table->string('company_or_workplace');
            $table->dateTime('issued_at');
            $table->string('issued_to_name');
            $table->string('issued_to_id_card_number');
            $table->string('security_service')->nullable();
            $table->dateTime('returned_at')->nullable();
            $table->string('returned_by_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_key_card_handovers');
    }
};
