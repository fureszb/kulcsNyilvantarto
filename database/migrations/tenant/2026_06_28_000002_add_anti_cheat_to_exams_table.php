<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('exams', function (Blueprint $table) {
            $table->unsignedInteger('max_attempts')->nullable()->after('sort_order');
            $table->unsignedInteger('cooldown_minutes')->default(0)->after('max_attempts');
            $table->boolean('shuffle_questions')->default(false)->after('cooldown_minutes');
            $table->boolean('shuffle_answers')->default(false)->after('shuffle_questions');
            $table->unsignedInteger('time_limit_minutes')->nullable()->after('shuffle_answers');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('exams', function (Blueprint $table) {
            $table->dropColumn(['max_attempts', 'cooldown_minutes', 'shuffle_questions', 'shuffle_answers', 'time_limit_minutes']);
        });
    }
};
