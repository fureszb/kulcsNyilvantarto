<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('pm_message_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pm_message_id')->constrained('pm_messages')->cascadeOnDelete();
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_name');
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('pm_message_replies');
    }
};
