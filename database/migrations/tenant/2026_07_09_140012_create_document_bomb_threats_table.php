<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_bomb_threats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->text('call_transcript');
            $table->string('caller_gender'); // ferfi|no
            $table->string('caller_age_group'); // fiatal|kozepkoru|idos|gyermek_lany|gyermek_fiu
            $table->string('speech_style'); // normalis|idegen_akcentus|tajszolas|hadaro|magabiztos|gyors|
                                            // lassu|tagolt|vontatott|posze|felolvasott|irodalmi
            $table->string('voice_tone'); // magas|mely|lagy|suttogo|halk|torzitott|rekedt|orrhang|hangos
            $table->string('emotional_state'); // raero|izgatott|pattogo|kiabalo|nyugodt|erzelmes|dadogo|
                                               // vidam|tragar|ittas|selypito|osszefuggestelen
            $table->string('background_noise'); // semmi|vasutallomas|tarsasag|utcai_forgalom|csorompoles|
                                                // zene|gyar_uzem|tv|szorakozohely|hivatali_zaj
            $table->string('area_familiarity'); // altalanos|szakszeru|helyi_ismeretre_vallo
            $table->text('other_remarks')->nullable();
            $table->dateTime('call_datetime');
            $table->string('caller_phone_number')->nullable();
            $table->string('receiver_name');
            $table->string('receiver_position');
            $table->date('receiver_birth_date');
            $table->string('receiver_mother_name');
            $table->string('receiver_address');
            $table->string('receiver_id_card_number');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_bomb_threats');
    }
};
