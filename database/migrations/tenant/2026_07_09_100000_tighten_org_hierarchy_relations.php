<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A szervezeti hierarchiát az ER-diagram szerint N:N-ről N:1/1:1-re szigorítjuk:
 *  - Irodaház → EGY felelős biztonsági vezető (locations.security_lead_id;
 *    egy vezető viszont több irodaházért is felelhet — 1:N a vezető oldaláról).
 *  - PM/dolgozó → EGY irodaház (users.location_id).
 *  - Biztonsági vezető → EGY felügyelő területi igazgató (users.director_id).
 *
 * A régi pivot táblákat (location_manager, location_user, director_lead)
 * NEM töröljük — a meglévő adatot ezekből migráljuk át (a legkorábbi
 * hozzárendelés "nyer" ütközés esetén), de a táblák érintetlenül megmaradnak
 * biztonsági/visszaállítási tartaléknak.
 */
return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->table('locations', function (Blueprint $table) {
            $table->foreignId('security_lead_id')->nullable()->after('id')
                ->constrained('users')->nullOnDelete();
        });

        Schema::connection('tenant')->table('users', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('role')
                ->constrained('locations')->nullOnDelete();
            $table->foreignId('director_id')->nullable()->after('location_id')
                ->constrained('users')->nullOnDelete();
        });

        // ── Adatmigráció a régi pivot táblákból (legkorábbi sor nyer) ──────

        // location_manager (security_lead) → locations.security_lead_id
        $seenLocation = [];
        DB::connection('tenant')->table('location_manager')
            ->join('users', 'users.id', '=', 'location_manager.manager_id')
            ->where('users.role', 'security_lead')
            ->orderBy('location_manager.id')
            ->select('location_manager.location_id', 'location_manager.manager_id')
            ->get()
            ->each(function ($row) use (&$seenLocation) {
                if (isset($seenLocation[$row->location_id])) return;
                $seenLocation[$row->location_id] = true;
                DB::connection('tenant')->table('locations')->where('id', $row->location_id)
                    ->update(['security_lead_id' => $row->manager_id]);
            });

        // location_manager (property_manager) → users.location_id
        $seenPm = [];
        DB::connection('tenant')->table('location_manager')
            ->join('users', 'users.id', '=', 'location_manager.manager_id')
            ->where('users.role', 'property_manager')
            ->orderBy('location_manager.id')
            ->select('location_manager.location_id', 'location_manager.manager_id')
            ->get()
            ->each(function ($row) use (&$seenPm) {
                if (isset($seenPm[$row->manager_id])) return;
                $seenPm[$row->manager_id] = true;
                DB::connection('tenant')->table('users')->where('id', $row->manager_id)
                    ->update(['location_id' => $row->location_id]);
            });

        // location_user (worker) → users.location_id
        $seenWorker = [];
        DB::connection('tenant')->table('location_user')
            ->orderBy('id')
            ->select('user_id', 'location_id')
            ->get()
            ->each(function ($row) use (&$seenWorker) {
                if (isset($seenWorker[$row->user_id])) return;
                $seenWorker[$row->user_id] = true;
                DB::connection('tenant')->table('users')->where('id', $row->user_id)
                    ->update(['location_id' => $row->location_id]);
            });

        // director_lead → users.director_id
        $seenLead = [];
        DB::connection('tenant')->table('director_lead')
            ->orderBy('id')
            ->select('lead_id', 'director_id')
            ->get()
            ->each(function ($row) use (&$seenLead) {
                if (isset($seenLead[$row->lead_id])) return;
                $seenLead[$row->lead_id] = true;
                DB::connection('tenant')->table('users')->where('id', $row->lead_id)
                    ->update(['director_id' => $row->director_id]);
            });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('director_id');
            $table->dropConstrainedForeignId('location_id');
        });
        Schema::connection('tenant')->table('locations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('security_lead_id');
        });
    }
};
