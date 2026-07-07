<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->create('vezenyles_areas', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::connection('tenant')->create('vezenyles_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('vezenyles_areas')->cascadeOnDelete();
            // Hibrid: opcionális kötés egy létező tenant user-hez (login-fiók).
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name');
            $table->timestamps();
            $table->unique(['area_id', 'name']);
        });

        Schema::connection('tenant')->create('vezenyles_schedule', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('vezenyles_employees')->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->integer('day');
            // Óraszám (pl. "24"), vagy jelölés: X / ? / +
            $table->string('value')->nullable();
            $table->unique(['employee_id', 'year', 'month', 'day']);
        });

        Schema::connection('tenant')->create('vezenyles_overrides', function (Blueprint $table) {
            $table->id();
            $table->integer('area_id');
            $table->integer('employee_id');
            $table->integer('year');
            $table->integer('month');
            $table->integer('day');
            $table->string('slot'); // 'night' | 'day'
            $table->integer('cover_employee_id');
            $table->integer('cover_area_id');
            $table->timestamps();
            $table->unique(['area_id', 'employee_id', 'year', 'month', 'day', 'slot'], 'vez_override_unique');
        });

        Schema::connection('tenant')->create('vezenyles_changelog', function (Blueprint $table) {
            $table->id();
            $table->integer('year')->nullable();
            $table->integer('month')->nullable();
            $table->integer('day')->nullable();
            $table->string('absent_employee')->nullable();
            $table->string('absent_area')->nullable();
            $table->string('cover_employee')->nullable();
            $table->string('cover_area')->nullable();
            $table->string('slot')->nullable();   // 'night' | 'day'
            $table->string('action')->nullable(); // 'assign' | 'undo'
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('vezenyles_changelog');
        Schema::connection('tenant')->dropIfExists('vezenyles_overrides');
        Schema::connection('tenant')->dropIfExists('vezenyles_schedule');
        Schema::connection('tenant')->dropIfExists('vezenyles_employees');
        Schema::connection('tenant')->dropIfExists('vezenyles_areas');
    }
};
