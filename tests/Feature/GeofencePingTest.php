<?php

namespace Tests\Feature;

use App\Jobs\SendNativePushJob;
use App\Jobs\SendPushJob;
use App\Models\GeofenceEvent;
use App\Models\GuardPosition;
use App\Models\Location;
use App\Models\TenantUser;
use Illuminate\Support\Facades\Queue;

/**
 * A `GeofenceController::ping` végpont eddig egyáltalán nem volt lefedve automatizált teszttel
 * (`GeofencePolygonTest` csak a harmadik féltől származó `Location\Polygon::contains()`
 * könyvtárat tesztelte közvetlenül, a kontrollert/route-ot/DB-t nem érintette) — lásd
 * docs/roadmap/map-and-nfc-todo.md "Backend-audit eredménye" szakaszát.
 */
class GeofencePingTest extends TenantTestCase
{
    /** Kb. 1km-es négyzet a Budai Vár körül — ugyanaz, mint a `GeofencePolygonTest`-ben. */
    private const POLYGON = [
        [47.4950, 19.0300],
        [47.4950, 19.0450],
        [47.5050, 19.0450],
        [47.5050, 19.0300],
    ];

    private const INSIDE = ['lat' => 47.5000, 'lng' => 19.0375];
    private const OUTSIDE = ['lat' => 47.5200, 'lng' => 19.0600];

    private function ping(TenantUser $worker, array $point): \Illuminate\Testing\TestResponse
    {
        return $this->postJson($this->apiUrl('geofence/ping'), [
            'lat' => $point['lat'],
            'lng' => $point['lng'],
            'accuracy' => 8.0,
            'recorded_at' => now()->toIso8601String(),
        ], $this->authHeaders($worker));
    }

    public function test_ping_without_work_location_returns_unknown(): void
    {
        $worker = $this->createTenantUser(['role' => 'user']);

        $response = $this->ping($worker, self::INSIDE);

        $response->assertOk()
            ->assertJsonPath('status', 'unknown')
            ->assertJsonPath('zone_status', 'unknown');
        $this->assertSame('unknown', GuardPosition::where('user_id', $worker->id)->first()->zone_status);
    }

    public function test_ping_at_location_without_polygon_returns_unknown(): void
    {
        $location = Location::create(['name' => 'No Polygon Office']);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);

        $response = $this->ping($worker, self::INSIDE);

        $response->assertOk()->assertJsonPath('zone_status', 'unknown');
    }

    public function test_ping_inside_polygon_returns_inside(): void
    {
        $location = Location::create(['name' => 'Polygon Office', 'polygon' => self::POLYGON]);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);

        $response = $this->ping($worker, self::INSIDE);

        $response->assertOk()->assertJsonPath('zone_status', 'inside');
        $this->assertSame(0, GuardPosition::where('user_id', $worker->id)->first()->consecutive_outside_count);
    }

    public function test_first_outside_ping_after_inside_does_not_flip_status_yet(): void
    {
        Queue::fake();
        $location = Location::create(['name' => 'Debounce Office', 'polygon' => self::POLYGON]);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);

        $this->ping($worker, self::INSIDE)->assertJsonPath('zone_status', 'inside');

        // Jitter/drift-debounce: az 1. és 2. kívüli ping még NEM válthatja "outside"-ra a
        // megerősített állapotot, csak a 3. egymást követő.
        $response = $this->ping($worker, self::OUTSIDE);

        $response->assertOk()->assertJsonPath('zone_status', 'inside');
        $this->assertSame(0, GeofenceEvent::count());
        Queue::assertNotPushed(SendPushJob::class);
    }

    public function test_third_consecutive_outside_ping_confirms_exit_and_notifies_bosses(): void
    {
        Queue::fake();
        $lead = $this->createTenantUser(['role' => 'security_lead', 'name' => 'Lead L']);
        $location = Location::create(['name' => 'Exit Office', 'polygon' => self::POLYGON]);
        $location->security_lead_id = $lead->id;
        $location->save();
        $pm = $this->createTenantUser(['role' => 'property_manager', 'location_id' => $location->id, 'name' => 'PM P']);
        $director = $this->createTenantUser(['role' => 'area_director', 'name' => 'Director D', 'director_id' => null]);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id, 'name' => 'Worker W']);

        $this->ping($worker, self::INSIDE)->assertJsonPath('zone_status', 'inside');
        $this->ping($worker, self::OUTSIDE)->assertJsonPath('zone_status', 'inside'); // 1. kívüli
        $this->ping($worker, self::OUTSIDE)->assertJsonPath('zone_status', 'inside'); // 2. kívüli
        $response = $this->ping($worker, self::OUTSIDE); // 3. kívüli — most vált

        $response->assertOk()->assertJsonPath('zone_status', 'outside');

        $event = GeofenceEvent::first();
        $this->assertNotNull($event);
        $this->assertSame('zone_exit', $event->event_type);
        $this->assertSame($worker->id, $event->user_id);
        $this->assertSame($location->id, $event->location_id);

        $expectedRecipients = fn ($job) =>
            in_array($lead->id, $job->userIds, true)
            && in_array($pm->id, $job->userIds, true)
            && !in_array($director->id, $job->userIds, true);

        Queue::assertPushed(SendPushJob::class, $expectedRecipients);
        Queue::assertPushed(SendNativePushJob::class, $expectedRecipients);
    }

    public function test_repeated_outside_pings_after_confirmed_exit_do_not_duplicate_events(): void
    {
        Queue::fake();
        $lead = $this->createTenantUser(['role' => 'security_lead']);
        $location = Location::create(['name' => 'No Spam Office', 'polygon' => self::POLYGON]);
        $location->security_lead_id = $lead->id;
        $location->save();
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);

        $this->ping($worker, self::INSIDE);
        $this->ping($worker, self::OUTSIDE);
        $this->ping($worker, self::OUTSIDE);
        $this->ping($worker, self::OUTSIDE); // megerősített kilépés — 1 esemény

        Queue::fake(); // az eddigi dispatch-eket ne számoljuk bele a lenti assertPushed-ba
        $this->ping($worker, self::OUTSIDE); // 4. kívüli — már megerősítve "outside", nem újdonság
        $this->ping($worker, self::OUTSIDE); // 5. kívüli

        $this->assertSame(1, GeofenceEvent::count());
        Queue::assertNotPushed(SendPushJob::class);
    }

    public function test_returning_inside_after_outside_confirms_immediately_and_notifies(): void
    {
        Queue::fake();
        $lead = $this->createTenantUser(['role' => 'security_lead']);
        $location = Location::create(['name' => 'Return Office', 'polygon' => self::POLYGON]);
        $location->security_lead_id = $lead->id;
        $location->save();
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);

        $this->ping($worker, self::INSIDE);
        $this->ping($worker, self::OUTSIDE);
        $this->ping($worker, self::OUTSIDE);
        $this->ping($worker, self::OUTSIDE)->assertJsonPath('zone_status', 'outside');

        Queue::fake();
        // A visszatérés NEM debounce-olt — egyetlen "belül" ping azonnal megerősíti.
        $response = $this->ping($worker, self::INSIDE);

        $response->assertOk()->assertJsonPath('zone_status', 'inside');
        $this->assertSame('zone_enter', GeofenceEvent::latest('id')->first()->event_type);
        Queue::assertPushed(SendPushJob::class, fn ($job) => in_array($lead->id, $job->userIds, true));
    }
}
