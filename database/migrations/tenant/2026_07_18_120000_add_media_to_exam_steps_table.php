<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('exam_steps', function (Blueprint $table) {
            $table->string('media_path')->nullable()->after('question_type');
            $table->unsignedTinyInteger('media_width')->default(100)->after('media_path');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('exam_steps', function (Blueprint $table) {
            $table->dropColumn(['media_path', 'media_width']);
        });
    }
};
