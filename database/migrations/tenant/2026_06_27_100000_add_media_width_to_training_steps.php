<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('training_steps', function (Blueprint $table) {
            $table->unsignedTinyInteger('media_width')->default(100)->after('media_path');
            $table->unsignedTinyInteger('reveal_media_width')->default(100)->after('reveal_media_path');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('training_steps', function (Blueprint $table) {
            $table->dropColumn(['media_width', 'reveal_media_width']);
        });
    }
};
