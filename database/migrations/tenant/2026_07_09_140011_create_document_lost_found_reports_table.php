<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_lost_found_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('subject');
            $table->dateTime('recorded_at');
            $table->string('location_text');
            $table->foreignId('representative_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('witness_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('guard_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('content_description');
            $table->dateTime('handed_over_at')->nullable();
            $table->string('recipient_name');
            $table->string('recipient_id_card_number');
            $table->string('recipient_address');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_lost_found_reports');
    }
};
