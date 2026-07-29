<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\VezenylesArea;
use App\Models\VezenylesEmployee;
use App\Models\VezenylesSchedule;

/**
 * Regresszió-védelem: a `VezenylesController::index()` (mobil API + web) a user saját
 * beosztás-sorát a `VezenylesArea.location_id`-n keresztül, a user `location_id`-jéhez (
 * `workLocations()`) képest szűrte — valós admin-adateltérés esetén (a terület más
 * telephelyhez van rögzítve, mint amihez a user maga be van osztva) ez a user SAJÁT
 * beosztás-sorát is kiszűrte a válaszból, holott a `VezenylesEmployee.user_id` egyértelműen
 * hozzá van kötve. 2026-07-18-i javítás: a user saját, `user_id`-vel hozzá kötött employee-
 * sorának területe MINDIG bekerül a látható területek közé, a location-alapú szűréstől
 * függetlenül.
 */
class VezenylesOwnRowVisibilityTest extends TenantTestCase
{
    public function test_mobile_api_includes_own_schedule_row_despite_area_location_mismatch(): void
    {
        $homeLocation = Location::create(['name' => 'Home Office']);
        $areaLocation = Location::create(['name' => 'Area Office']);

        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $homeLocation->id]);

        // A terület egy MÁSIK telephelyhez van rögzítve, mint amihez a user be van osztva.
        $area = VezenylesArea::create(['name' => 'Mismatched Area', 'location_id' => $areaLocation->id]);
        $employee = VezenylesEmployee::create(['area_id' => $area->id, 'user_id' => $worker->id, 'name' => $worker->name]);
        $now = now();
        VezenylesSchedule::create([
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => '8',
        ]);

        $response = $this->getJson($this->apiUrl('vezenyles?year=' . $now->year . '&month=' . $now->month), $this->authHeaders($worker));

        $response->assertOk();
        $employees = collect($response->json('employees'));
        $ownEmployee = $employees->firstWhere('user_id', $worker->id);

        $this->assertNotNull($ownEmployee, 'A user saját vezénylés-sorának szerepelnie kell a válaszban.');

        $schedule = collect($response->json('schedule'))->where('employee_id', $ownEmployee['id']);
        $this->assertTrue($schedule->contains(fn ($s) => $s['day'] === (int) $now->day && $s['value'] === '8'));
    }

    public function test_web_vezenyles_includes_own_schedule_row_despite_area_location_mismatch(): void
    {
        $homeLocation = Location::create(['name' => 'Home Office Web']);
        $areaLocation = Location::create(['name' => 'Area Office Web']);

        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $homeLocation->id]);

        $area = VezenylesArea::create(['name' => 'Mismatched Area Web', 'location_id' => $areaLocation->id]);
        VezenylesEmployee::create(['area_id' => $area->id, 'user_id' => $worker->id, 'name' => $worker->name]);

        $this->pointAtTenantDb();
        $response = $this->withSession(['auth_tenant' => $this->tenantSlug])
            ->actingAs($worker, 'tenant')
            ->get('/' . $this->tenantSlug . '/vezenyles');

        $response->assertOk();
        $employees = collect($response->viewData('page')['props']['employees']);

        $this->assertTrue($employees->contains(fn ($e) => $e['user_id'] === $worker->id));
    }
}
