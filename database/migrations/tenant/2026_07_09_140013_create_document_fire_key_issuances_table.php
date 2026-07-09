<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_fire_key_issuances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('seal_number');
            $table->boolean('seal_removed')->default(false);
            $table->boolean('seal_applied')->default(false);
            $table->dateTime('issued_at');
            $table->text('issue_reason');
            $table->dateTime('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_fire_key_issuances');
    }
};
