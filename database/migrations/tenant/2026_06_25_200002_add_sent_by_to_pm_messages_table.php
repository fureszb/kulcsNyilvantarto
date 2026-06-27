<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('pm_messages', function (Blueprint $table) {
            if (!Schema::connection('tenant')->hasColumn('pm_messages', 'sent_by_user_id')) {
                $table->unsignedBigInteger('sent_by_user_id')->nullable()->after('send_to_all');
            }
            if (!Schema::connection('tenant')->hasColumn('pm_messages', 'sent_by_name')) {
                $table->string('sent_by_name')->nullable()->after('sent_by_user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('pm_messages', function (Blueprint $table) {
            $table->dropColumn(['sent_by_user_id', 'sent_by_name']);
        });
    }
};
