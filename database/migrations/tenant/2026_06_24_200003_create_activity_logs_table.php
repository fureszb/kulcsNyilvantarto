<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type');          // check.completed, training.completed, exam.completed
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name');
            $table->string('description');
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
            $table->index(['occurred_at']);
            $table->index(['user_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('activity_logs');
    }
};
