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
            $table->string('question_type', 10)->default('radio')->after('question');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('training_steps', function (Blueprint $table) {
            $table->dropColumn('question_type');
        });
    }
};
