<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_type'); // feljegyzeses_jegyzokonyv|gepjarmu_beleptetes|eszkoz_atadas_atvetel|
                                              // karfelveteli_jegyzokonyv|kiuritesi_jegyzokonyv|kiuritesi_nyilvantartas|
                                              // kulcs_kartya_atadas_atvetel|talalt_targy_jegyzokonyv|
                                              // robbantasi_fenyegetes|tuzkulcs_tuzkazetta_kiadas
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('created_by_user_id')->constrained('users')->restrictOnDelete();
            $table->string('status')->default('draft'); // draft|finalized
            $table->string('pdf_path')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('documents');
    }
};
