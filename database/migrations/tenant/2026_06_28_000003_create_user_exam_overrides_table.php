<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('user_exam_overrides', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->unsignedInteger('max_attempts')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'exam_id']);
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('user_exam_overrides');
    }
};
