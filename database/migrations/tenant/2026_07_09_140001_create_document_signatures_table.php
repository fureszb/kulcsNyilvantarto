<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('role'); // jegyzokonyv_vezeto|tanu|kepviselo|karokozo|biztonsagi_szolgalat|
                                    // felvevo|leado|visszavevo|tuzvedelmi_felelos|hivast_fogado|felvette|leadta|atvevo
            $table->string('signer_name')->nullable();
            // Ideiglenes tárolás — a PDF sikeres generálása után azonnal törlődik a
            // fájl a lemezről ÉS ez az oszlop null-ra áll (a kép a PDF-be már
            // beágyazva marad).
            $table->string('signature_path')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('embedded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_signatures');
    }
};
