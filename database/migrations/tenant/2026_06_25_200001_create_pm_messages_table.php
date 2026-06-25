<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('pm_messages', function (Blueprint $table) {
            $table->id();
            $table->text('content');
            $table->boolean('send_to_all')->default(false);
            $table->timestamps();
        });

        Schema::connection('tenant')->create('pm_message_recipients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pm_message_id');
            $table->unsignedBigInteger('user_id');

            $table->foreign('pm_message_id')->references('id')->on('pm_messages')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('pm_message_recipients');
        Schema::connection('tenant')->dropIfExists('pm_messages');
    }
};
