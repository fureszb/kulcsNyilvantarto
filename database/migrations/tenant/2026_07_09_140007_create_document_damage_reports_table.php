<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_damage_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->dateTime('recorded_from');
            $table->dateTime('recorded_to');
            $table->string('location_text');
            $table->string('subject');
            // Károkozó adatai
            $table->string('perpetrator_name');
            $table->string('perpetrator_id_card_number');
            $table->string('perpetrator_birth_place');
            $table->date('perpetrator_birth_date');
            $table->string('perpetrator_mother_name');
            $table->string('perpetrator_address');
            $table->string('perpetrator_phone')->nullable();
            $table->string('perpetrator_email')->nullable();
            $table->foreignId('guard_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('witness_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('event_description');
            $table->boolean('perpetrator_admitted');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_damage_reports');
    }
};
