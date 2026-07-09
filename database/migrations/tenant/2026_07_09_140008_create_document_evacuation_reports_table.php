<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('document_evacuation_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('prepared_by');
            $table->string('prepared_by_position');
            $table->string('location_text');
            $table->date('event_date');
            $table->text('event_description');
            $table->string('alarm_type');
            $table->text('alarm_reason');
            $table->string('evacuation_type');
            $table->text('fire_alarm_control_notes');
            $table->text('deficiencies')->nullable();
            $table->text('guard_duty_obligations')->nullable();
            $table->text('tenant_obligations')->nullable();

            $table->boolean('had_alarm');

            // Ha volt riasztás/tűzjelzés
            $table->text('fire_what_ignited')->nullable();
            $table->text('fire_life_in_danger')->nullable();
            $table->text('fire_extinguished_how')->nullable();
            $table->dateTime('fire_commander_arrival_time')->nullable();
            $table->text('fire_reentry_protocol')->nullable();
            $table->text('fire_cause_responsible')->nullable();

            // Ha nem volt riasztás
            $table->boolean('had_early_warning')->nullable();
            $table->boolean('delay_before_siren')->nullable();
            $table->text('no_delay_reason')->nullable();
            $table->text('no_delay_corrective_actions')->nullable();
            $table->text('delay_reason_not_reacted')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('document_evacuation_reports');
    }
};
