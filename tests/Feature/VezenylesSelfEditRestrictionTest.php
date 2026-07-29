<?php

namespace Tests\Feature;

use App\Models\VezenylesArea;
use App\Models\VezenylesEmployee;
use App\Models\VezenylesSchedule;

/**
 * 2026-07-18-i kör: a sima dolgozó a saját "Beosztásom" sorát csak ráérés-jelzésként
 * szerkesztheti ("+" túlóra vállalása / "X" nem tud dolgozni, vagy törlés) — tényleges
 * óraszámot vagy "?"-et nem adhat meg magának, azt csak admin/területi igazgató/biztonsági
 * vezető állíthatja be (`VezenylesController::upsertSchedule` self-edit ág).
 */
class VezenylesSelfEditRestrictionTest extends TenantTestCase
{
    private function ownEmployeeFor(int $userId, string $name): VezenylesEmployee
    {
        $area = VezenylesArea::create(['name' => 'Terület ' . uniqid()]);
        return VezenylesEmployee::create(['area_id' => $area->id, 'user_id' => $userId, 'name' => $name]);
    }

    public function test_worker_can_set_own_cell_to_plus(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Worker Plus']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();

        $response = $this->postJson($this->apiUrl('vezenyles/schedule'), [
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => '+',
        ], $this->authHeaders($worker));

        $response->assertOk();
        $this->assertSame('+', VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }

    public function test_worker_can_set_own_cell_to_x(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Worker X']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();

        $response = $this->postJson($this->apiUrl('vezenyles/schedule'), [
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => 'X',
        ], $this->authHeaders($worker));

        $response->assertOk();
        $this->assertSame('X', VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }

    public function test_worker_can_clear_own_cell(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Worker Clear']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();
        VezenylesSchedule::create([
            'employee_id' => $employee->id, 'year' => $now->year, 'month' => $now->month,
            'day' => $now->day, 'value' => '+',
        ]);

        $response = $this->postJson($this->apiUrl('vezenyles/schedule'), [
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => '',
        ], $this->authHeaders($worker));

        $response->assertOk();
        $this->assertNull(VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }

    public function test_worker_cannot_set_own_cell_to_numeric_hours(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Worker Numeric']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();

        $response = $this->postJson($this->apiUrl('vezenyles/schedule'), [
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => '8',
        ], $this->authHeaders($worker));

        $response->assertStatus(422);
        $this->assertNull(VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }

    public function test_worker_cannot_set_own_cell_to_uncertain(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Worker Uncertain']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();

        $response = $this->postJson($this->apiUrl('vezenyles/schedule'), [
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => '?',
        ], $this->authHeaders($worker));

        $response->assertStatus(422);
    }

    public function test_admin_can_still_assign_numeric_hours_to_worker(): void
    {
        $admin = $this->createTenantUser(['role' => 'admin', 'name' => 'Admin']);
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Worker Managed']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();

        $response = $this->postJson($this->apiUrl('vezenyles/schedule'), [
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => '8',
        ], $this->authHeaders($admin));

        $response->assertOk();
        $this->assertSame('8', VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }

    public function test_security_lead_can_assign_numeric_hours_to_own_cell(): void
    {
        $lead = $this->createTenantUser(['role' => 'security_lead', 'name' => 'Lead Self']);
        $employee = $this->ownEmployeeFor($lead->id, $lead->name);
        $now = now();

        $response = $this->postJson($this->apiUrl('vezenyles/schedule'), [
            'employee_id' => $employee->id,
            'year'        => $now->year,
            'month'       => $now->month,
            'day'         => $now->day,
            'value'       => '10',
        ], $this->authHeaders($lead));

        $response->assertOk();
        $this->assertSame('10', VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }

    public function test_web_worker_cannot_set_own_cell_to_numeric_hours(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Web Worker Numeric']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();

        $this->pointAtTenantDb();
        $response = $this->withSession(['auth_tenant' => $this->tenantSlug])
            ->actingAs($worker, 'tenant')
            ->post('/' . $this->tenantSlug . '/vezenyles/schedule', [
                'employee_id' => $employee->id,
                'year'        => $now->year,
                'month'       => $now->month,
                'day'         => $now->day,
                'value'       => '8',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertNull(VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }

    public function test_web_worker_can_set_own_cell_to_x(): void
    {
        $worker = $this->createTenantUser(['role' => 'user', 'name' => 'Web Worker X']);
        $employee = $this->ownEmployeeFor($worker->id, $worker->name);
        $now = now();

        $this->pointAtTenantDb();
        $response = $this->withSession(['auth_tenant' => $this->tenantSlug])
            ->actingAs($worker, 'tenant')
            ->post('/' . $this->tenantSlug . '/vezenyles/schedule', [
                'employee_id' => $employee->id,
                'year'        => $now->year,
                'month'       => $now->month,
                'day'         => $now->day,
                'value'       => 'X',
            ]);

        $response->assertRedirect();
        $response->assertSessionMissing('error');
        $this->assertSame('X', VezenylesSchedule::where('employee_id', $employee->id)->value('value'));
    }
}
