<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('director_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('from_user_id')->nullable(); // null = rendszer üzenet
            $table->unsignedBigInteger('to_user_id');
            $table->text('content');
            $table->boolean('is_anonymous')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index('to_user_id');
            $table->index('from_user_id');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('director_messages');
    }
};
