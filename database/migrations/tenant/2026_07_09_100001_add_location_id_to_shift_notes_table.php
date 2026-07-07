<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Váltóüzenetek irodaházhoz kötése (csoportosított chat épületenként).
 *  A meglévő üzeneteket a szerzőjük users.location_id-jával töltjük fel —
 *  ez a migráció a users.location_id-t beállító migráció UTÁN fut. */
return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('shift_notes', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('user_id')
                ->constrained('locations')->nullOnDelete();
        });

        DB::connection('tenant')->statement(
            'UPDATE shift_notes SET location_id = (SELECT location_id FROM users WHERE users.id = shift_notes.user_id) WHERE location_id IS NULL'
        );
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('shift_notes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('location_id');
        });
    }
};
