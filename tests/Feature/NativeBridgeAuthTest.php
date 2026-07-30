<?php

namespace Tests\Feature;

/**
 * A `native.*` route-csoport (routes/web.php) ugyanazokat az Api\* controller-
 * metódusokat hívja, mint a bearer-tokenes Kotlin mobil API, de `auth:tenant`
 * session-guarddal — ezt a bekötést (nem a mögöttes üzleti logikát, azt az
 * Api\*ControllerTest-ek már fedik) teszteli ez a fájl: hitelesített tenant-
 * munkamenettel átmegy, anélkül 401-et ad (nem redirectel loginra, mert a
 * kérés JSON-t vár — Laravel ezt automatikusan felismeri).
 */
class NativeBridgeAuthTest extends TenantTestCase
{
    public function test_authenticated_tenant_session_can_ping_geofence(): void
    {
        $worker = $this->createTenantUser(['role' => 'user']);

        $this->pointAtTenantDb();
        $response = $this->actingAs($worker, 'tenant')
            ->postJson("/{$this->tenantSlug}/native/geofence/ping", [
                'lat' => 47.4979,
                'lng' => 19.0402,
                'accuracy' => 10,
                'recorded_at' => now()->toIso8601String(),
            ]);

        $response->assertOk();
        $response->assertJsonStructure(['status', 'zone_status']);
    }

    public function test_unauthenticated_request_gets_401_not_redirect(): void
    {
        $this->pointAtTenantDb();
        $response = $this->postJson("/{$this->tenantSlug}/native/geofence/ping", [
            'lat' => 47.4979,
            'lng' => 19.0402,
            'accuracy' => 10,
            'recorded_at' => now()->toIso8601String(),
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_tenant_session_can_reach_nfc_scan_endpoint(): void
    {
        $worker = $this->createTenantUser(['role' => 'user']);

        $this->pointAtTenantDb();
        $response = $this->actingAs($worker, 'tenant')
            ->postJson("/{$this->tenantSlug}/native/nfc/scan", [
                'tag_uid' => 'DE:AD:BE:EF',
                'scanned_at' => now()->toIso8601String(),
            ]);

        // Ismeretlen matrica — de a lényeg, hogy a middleware-lánc (auth:tenant +
        // tenant) átengedte, és a controller ténylegesen lefutott (404, nem 401).
        $response->assertStatus(404);
    }

    public function test_unauthenticated_nfc_scan_gets_401(): void
    {
        $this->pointAtTenantDb();
        $response = $this->postJson("/{$this->tenantSlug}/native/nfc/scan", [
            'tag_uid' => 'DE:AD:BE:EF',
        ]);

        $response->assertStatus(401);
    }
}
