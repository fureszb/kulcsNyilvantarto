<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Location;
use App\Models\NfcTag;
use App\Models\VezenylesArea;
use App\Models\VezenylesEmployee;
use App\Models\VezenylesSchedule;

/**
 * A 2026-07-18-i kör regressziós védelme: (1) a dashboard "ki van bent" jelvények forrása az
 * NFC self-report (`is_present`) helyett a napi Vezenylés-beosztás, (2) az NFC scan válasz és
 * a profil "NFC előzmények"/"Mai bejárás" végpontjai valós adatot adnak, admin-címkével.
 */
class NfcAndPresenceTest extends TenantTestCase
{
    private function scheduleToday(int $userId, string $value = '8'): void
    {
        $area = VezenylesArea::create(['name' => 'Terület ' . uniqid()]);
        $employee = VezenylesEmployee::create(['area_id' => $area->id, 'user_id' => $userId, 'name' => 'X']);
        $now = now();
        VezenylesSchedule::create([
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => $value,
        ]);
    }

    public function test_security_lead_team_presence_reflects_schedule_not_nfc_flag(): void
    {
        $lead = $this->createTenantUser(['role' => 'security_lead']);
        $location = Location::create(['name' => 'Office']);
        $location->security_lead_id = $lead->id;
        $location->save();

        // Beosztva mára, de az NFC-flag hamis — mégis "bent"-nek kell mutatnia.
        $scheduledWorker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'is_present' => false, 'name' => 'Scheduled Worker']);
        $this->scheduleToday($scheduledWorker->id);

        // NFC-flag igaz, de nincs mai beosztása — NEM szabad "bent"-nek mutatnia.
        $notScheduledWorker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'is_present' => true, 'name' => 'Not Scheduled Worker']);

        $response = $this->getJson($this->apiUrl('security-lead/dashboard'), $this->authHeaders($lead));

        $response->assertOk();
        $teamPresence = collect($response->json('team_presence'));

        $this->assertTrue($teamPresence->firstWhere('name', $scheduledWorker->name)['is_present']);
        $this->assertFalse($teamPresence->firstWhere('name', $notScheduledWorker->name)['is_present']);
    }

    public function test_property_manager_guards_on_duty_reflects_schedule(): void
    {
        $location = Location::create(['name' => 'PM Office']);
        $pm = $this->createTenantUser(['role' => 'property_manager', 'location_id' => $location->id]);

        $scheduledWorker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'is_present' => false]);
        $this->scheduleToday($scheduledWorker->id);
        $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'is_present' => true]);

        $response = $this->getJson($this->apiUrl('pm/dashboard'), $this->authHeaders($pm));

        $response->assertOk();
        $this->assertSame('1/2', $response->json('guards_on_duty_label'));
    }

    public function test_day_off_schedule_value_does_not_count_as_present(): void
    {
        $lead = $this->createTenantUser(['role' => 'security_lead']);
        $location = Location::create(['name' => 'Office X']);
        $location->security_lead_id = $lead->id;
        $location->save();

        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);
        $this->scheduleToday($worker->id, 'X');

        $response = $this->getJson($this->apiUrl('security-lead/dashboard'), $this->authHeaders($lead));

        $response->assertOk();
        $teamPresence = collect($response->json('team_presence'));
        $this->assertFalse($teamPresence->firstWhere('name', $worker->name)['is_present']);
    }

    public function test_nfc_scan_response_includes_tag_label(): void
    {
        $location = Location::create(['name' => 'Tagged Office']);
        $tag = NfcTag::create(['uid' => 'AA:BB:CC', 'location_id' => $location->id, 'label' => 'Recepció', 'is_active' => true]);
        $worker = $this->createTenantUser(['role' => 'user']);
        $worker->nfcLocations()->attach($location->id);

        $response = $this->postJson($this->apiUrl('nfc/scan'), ['tag_uid' => 'AA:BB:CC'], $this->authHeaders($worker));

        $response->assertOk()
            ->assertJsonPath('status', 'checked')
            ->assertJsonPath('tag.label', 'Recepció')
            ->assertJsonPath('tag.id', $tag->id);
    }

    /** Regresszió-védelem a 2026-07-18 előtti be/kilépés-toggle hibájára: két KÜLÖNBÖZŐ
     *  checkpointot ugyanazon a telephelyen egymás után beolvasva mindkettőnek "checked"-nek
     *  kell lennie — a régi modell a másodikat tévesen "kilépésnek" értelmezte volna, mert
     *  csak telephely-szinten, nem matrica-szinten követte a jogosultságot. */
    public function test_scanning_two_checkpoints_at_same_location_are_both_checked(): void
    {
        $location = Location::create(['name' => 'Multi Checkpoint Office']);
        $backDoor = NfcTag::create(['uid' => 'BACK:DOOR', 'location_id' => $location->id, 'label' => 'Hátsó ajtó', 'is_active' => true]);
        $elevator = NfcTag::create(['uid' => 'LIFT:1', 'location_id' => $location->id, 'label' => 'Lift', 'is_active' => true]);
        $worker = $this->createTenantUser(['role' => 'user']);
        $worker->nfcLocations()->attach($location->id);

        $this->postJson($this->apiUrl('nfc/scan'), ['tag_uid' => 'BACK:DOOR'], $this->authHeaders($worker))
            ->assertOk()
            ->assertJsonPath('status', 'checked')
            ->assertJsonPath('tag.label', 'Hátsó ajtó');

        $this->postJson($this->apiUrl('nfc/scan'), ['tag_uid' => 'LIFT:1'], $this->authHeaders($worker))
            ->assertOk()
            ->assertJsonPath('status', 'checked')
            ->assertJsonPath('tag.label', 'Lift');

        // A rendszer nem beléptető/kiléptető kapu — a scan nem írhatja át az is_present flaget.
        $this->assertFalse($worker->fresh()->is_present);
    }

    public function test_nfc_history_returns_own_entries_with_tag_label(): void
    {
        $location = Location::create(['name' => 'History Office']);
        $tag = NfcTag::create(['uid' => 'HH:II', 'location_id' => $location->id, 'label' => 'Főbejárat', 'is_active' => true]);
        $worker = $this->createTenantUser(['role' => 'user']);
        $worker->nfcLocations()->attach($location->id);
        $otherWorker = $this->createTenantUser(['role' => 'user']);

        $this->postJson($this->apiUrl('nfc/scan'), ['tag_uid' => 'HH:II'], $this->authHeaders($worker))->assertOk();

        // Egy másik user scanje NE jelenjen meg az első user előzményeiben.
        ActivityLog::record('nfc.checkpoint', $otherWorker, 'Ellenőrizve — más', ['tag_uid' => 'ZZ', 'tag_label' => 'Más', 'location_id' => $location->id, 'location_name' => $location->name]);

        $response = $this->getJson($this->apiUrl('nfc/history'), $this->authHeaders($worker));

        $response->assertOk();
        $entries = $response->json('entries');
        $this->assertCount(1, $entries);
        $this->assertSame('Főbejárat', $entries[0]['tag_label']);
        $this->assertSame('nfc.checkpoint', $entries[0]['event_type']);
    }

    public function test_nfc_today_checklist_lists_location_tags_with_scanned_status(): void
    {
        $location = Location::create(['name' => 'Checklist Office']);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);
        $worker->nfcLocations()->attach($location->id);

        $scannedTag = NfcTag::create(['uid' => 'SCAN:1', 'location_id' => $location->id, 'label' => 'Főbejárat', 'is_active' => true]);
        NfcTag::create(['uid' => 'SCAN:2', 'location_id' => $location->id, 'label' => 'Raktár', 'is_active' => true]);

        $this->postJson($this->apiUrl('nfc/scan'), ['tag_uid' => 'SCAN:1'], $this->authHeaders($worker))->assertOk();

        $response = $this->getJson($this->apiUrl('nfc/today-checklist'), $this->authHeaders($worker));

        $response->assertOk();
        $points = collect($response->json('points'));
        $this->assertCount(2, $points);
        $this->assertTrue($points->firstWhere('label', 'Főbejárat')['scanned']);
        $this->assertFalse($points->firstWhere('label', 'Raktár')['scanned']);
    }

    /** A webes "Ki van bent" oldal (`PresenceController`) 2026-07-18 óta a Vezenylés-beosztásból
     *  dolgozik, nem az NFC self-reportból — ugyanaz a szabály, mint a dashboard-jelvényeknél. */
    public function test_web_presence_page_lists_scheduled_workers_not_nfc_flag(): void
    {
        $lead = $this->createTenantUser(['role' => 'security_lead']);
        $location = Location::create(['name' => 'Web Presence Office']);
        $location->security_lead_id = $lead->id;
        $location->save();

        $scheduledWorker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'is_present' => false, 'name' => 'Scheduled Worker']);
        $this->scheduleToday($scheduledWorker->id, '6');

        $notScheduledWorker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'is_present' => true, 'name' => 'Not Scheduled Worker']);

        $this->pointAtTenantDb();
        $response = $this->withSession(['auth_tenant' => $this->tenantSlug])
            ->actingAs($lead, 'tenant')
            ->get('/' . $this->tenantSlug . '/presence');

        $response->assertOk();
        $presentUsers = collect($response->viewData('page')['props']['presentUsers']);

        $this->assertTrue($presentUsers->contains(fn ($u) => $u['name'] === 'Scheduled Worker' && $u['schedule_value'] === '6'));
        $this->assertFalse($presentUsers->contains(fn ($u) => $u['name'] === 'Not Scheduled Worker'));
    }

    /** A dolgozó saját "Jelenlegi állapotod" kártyája (mobil Kezdőlap + webes Portál) mutassa,
     *  hogy szolgálatban van-e ma — függetlenül attól, hogy scannelt-e már NFC-checkpointot. */
    public function test_home_presence_reflects_on_duty_schedule_independent_of_checkpoints(): void
    {
        $location = Location::create(['name' => 'Duty Office']);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'name' => 'Duty Worker']);
        $this->scheduleToday($worker->id, '24');

        $response = $this->getJson($this->apiUrl('home'), $this->authHeaders($worker));

        $response->assertOk()
            ->assertJsonPath('presence.on_duty', true)
            ->assertJsonPath('presence.schedule_label', '24 óra')
            ->assertJsonPath('presence.checked_count', 0)
            ->assertJsonPath('presence.total_count', 0);
    }

    public function test_home_presence_not_on_duty_without_schedule_entry(): void
    {
        $worker = $this->createTenantUser(['role' => 'user']);

        $response = $this->getJson($this->apiUrl('home'), $this->authHeaders($worker));

        $response->assertOk()
            ->assertJsonPath('presence.on_duty', false)
            ->assertJsonPath('presence.schedule_label', null);
    }

    /** "Napi áttekintés" kártya (mobil Kezdőlap) — a MAI napi `vezenyles_schedule` sor
     *  numerikus (óraszám) értéke, nem a havi összeg. */
    public function test_home_hours_worked_today_reflects_only_todays_entry(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Hours Worker']);
        $area = VezenylesArea::create(['name' => 'Terület ' . uniqid()]);
        $employee = VezenylesEmployee::create(['area_id' => $area->id, 'user_id' => $worker->id, 'name' => $worker->name]);
        $now = now();

        VezenylesSchedule::create(['employee_id' => $employee->id, 'year' => $now->year, 'month' => $now->month, 'day' => $now->day, 'value' => '8']);
        // Egy másik napi bejegyzés a hónapban — a mai napi értéknek NEM szabad összeadódnia vele.
        $otherDay = $now->day === 1 ? 2 : 1;
        VezenylesSchedule::create(['employee_id' => $employee->id, 'year' => $now->year, 'month' => $now->month, 'day' => $otherDay, 'value' => '10']);

        $response = $this->getJson($this->apiUrl('home'), $this->authHeaders($worker));

        $response->assertOk()->assertJsonPath('hours_worked_today', 8);
    }

    public function test_home_hours_worked_today_is_zero_for_non_numeric_entry(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Hours Worker Off']);
        $area = VezenylesArea::create(['name' => 'Terület ' . uniqid()]);
        $employee = VezenylesEmployee::create(['area_id' => $area->id, 'user_id' => $worker->id, 'name' => $worker->name]);
        $now = now();

        VezenylesSchedule::create(['employee_id' => $employee->id, 'year' => $now->year, 'month' => $now->month, 'day' => $now->day, 'value' => 'X']);

        $response = $this->getJson($this->apiUrl('home'), $this->authHeaders($worker));

        $response->assertOk()->assertJsonPath('hours_worked_today', 0);
    }

    /** Regresszió-védelem: a "Mai bejárás" checklistnek az NFC-beléptetési jogosultságot
     *  (`nfcLocations()`) kell követnie, NEM a "hol dolgozik" `location_id` mezőt — a kettő
     *  eltérhet egymástól (valós hiba: egy dolgozó `location_id`-je "Aréna Irodaház" volt, de
     *  csak "H2O Offices"-hez volt NFC-jogosultsága — a checklist ekkor 0/0-t mutatott, mert a
     *  location_id-hez tartozó telephelyen egyáltalán nem is volt matrica). */
    public function test_checklist_follows_nfc_locations_not_location_id(): void
    {
        $homeOffice = Location::create(['name' => 'Home Office (no tags)']);
        $nfcOffice = Location::create(['name' => 'NFC Office (has tags)']);
        NfcTag::create(['uid' => 'MISMATCH:1', 'location_id' => $nfcOffice->id, 'label' => 'Recepció', 'is_active' => true]);

        // A user "hol dolgozik"-ja a home office, de NFC-jogosultsága a nfcOffice-hoz van.
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $homeOffice->id]);
        $worker->nfcLocations()->attach($nfcOffice->id);

        $checklistResponse = $this->getJson($this->apiUrl('nfc/today-checklist'), $this->authHeaders($worker));
        $checklistResponse->assertOk();
        $this->assertSame(['NFC Office (has tags)'], $checklistResponse->json('location_names'));
        $this->assertCount(1, $checklistResponse->json('points'));

        $homeResponse = $this->getJson($this->apiUrl('home'), $this->authHeaders($worker));
        $homeResponse->assertOk()
            ->assertJsonPath('presence.venue_name', 'NFC Office (has tags)')
            ->assertJsonPath('presence.total_count', 1);
    }

    /** `docs/api-contract/nfc.md` szerint a 404 ismeretlen/inaktív matricára érvényes domain-
     *  válasz, nem hiba — eddig nem volt automatizált tesztje. */
    public function test_scanning_unknown_tag_returns_404_denied(): void
    {
        $worker = $this->createTenantUser(['role' => 'user']);

        $response = $this->postJson($this->apiUrl('nfc/scan'), ['tag_uid' => 'UNKNOWN:UID'], $this->authHeaders($worker));

        $response->assertStatus(404)
            ->assertJsonPath('status', 'denied')
            ->assertJsonMissingPath('tag');
    }

    /** `docs/api-contract/nfc.md` szerint a 403 jogosultság-hiányra érvényes domain-válasz, a
     *  `tag`-et is visszaadja (a felhasználó lássa, MELYIK matricához nincs joga) — eddig nem
     *  volt automatizált tesztje. */
    public function test_scanning_tag_without_permission_returns_403_denied_with_tag_label(): void
    {
        $location = Location::create(['name' => 'Restricted Office']);
        $tag = NfcTag::create(['uid' => 'NO:ACCESS', 'location_id' => $location->id, 'label' => 'Szerverterem', 'is_active' => true]);
        $worker = $this->createTenantUser(['role' => 'user']); // nincs nfcLocations() hozzárendelés

        $response = $this->postJson($this->apiUrl('nfc/scan'), ['tag_uid' => 'NO:ACCESS'], $this->authHeaders($worker));

        $response->assertStatus(403)
            ->assertJsonPath('status', 'denied')
            ->assertJsonPath('tag.label', 'Szerverterem')
            ->assertJsonPath('tag.id', $tag->id);
    }

    public function test_web_portal_includes_same_presence_widget(): void
    {
        $location = Location::create(['name' => 'Portal Duty Office']);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);
        $this->scheduleToday($worker->id, '8');

        $this->pointAtTenantDb();
        $response = $this->withSession(['auth_tenant' => $this->tenantSlug])
            ->actingAs($worker, 'tenant')
            ->get('/' . $this->tenantSlug);

        $response->assertOk();
        $presence = $response->viewData('page')['props']['presence'];

        $this->assertTrue($presence['on_duty']);
        $this->assertSame('8 óra', $presence['schedule_label']);
    }
}
