<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('nfc_tags', function (Blueprint $table) {
            $table->id();
            $table->string('uid')->unique();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('nfc_tags');
    }
};
