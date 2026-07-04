<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('ai_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('original_name');
            $table->string('stored_path');
            $table->unsignedBigInteger('size_bytes');
            $table->string('status')->default('pending'); // pending|processing|ready|failed
            $table->unsignedInteger('chunk_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('ai_documents');
    }
};
