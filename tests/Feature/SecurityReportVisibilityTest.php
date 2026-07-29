<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\SecurityDailyReport;
use App\Models\SecurityReportShare;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * A `SecurityReportController` szerepkör-alapú láthatósági/jogosultsági szabályait fedi le —
 * lásd `DocumentVisibilityTest` kommentjét, ugyanaz az indoklás.
 */
class SecurityReportVisibilityTest extends TenantTestCase
{
    private function makeLocationWithLead(): array
    {
        $lead = $this->createTenantUser(['role' => 'security_lead', 'name' => 'Lead A']);
        $location = Location::create(['name' => 'Location A']);
        $location->security_lead_id = $lead->id;
        $location->save();

        return [$location, $lead];
    }

    public function test_director_and_pm_see_all_reports_in_index(): void
    {
        [$locationA, ] = $this->makeLocationWithLead();
        $worker = $this->createTenantUser(['role' => 'user']);
        $report = SecurityDailyReport::create(['report_date' => today(), 'created_by_user_id' => $worker->id]);
        $report->locations()->attach($locationA->id);

        $director = $this->createTenantUser(['role' => 'area_director']);
        $pm = $this->createTenantUser(['role' => 'property_manager']);

        $this->getJson($this->apiUrl('security-reports'), $this->authHeaders($director))
            ->assertOk()->assertJsonCount(1);

        $this->getJson($this->apiUrl('security-reports'), $this->authHeaders($pm))
            ->assertOk()->assertJsonCount(1);
    }

    public function test_security_lead_sees_only_reports_for_managed_locations(): void
    {
        [$locationA, $leadA] = $this->makeLocationWithLead();
        [$locationB, ] = $this->makeLocationWithLead();
        $worker = $this->createTenantUser(['role' => 'user']);

        $reportA = SecurityDailyReport::create(['report_date' => today(), 'created_by_user_id' => $worker->id]);
        $reportA->locations()->attach($locationA->id);

        $reportB = SecurityDailyReport::create(['report_date' => today(), 'created_by_user_id' => $worker->id]);
        $reportB->locations()->attach($locationB->id);

        $response = $this->getJson($this->apiUrl('security-reports'), $this->authHeaders($leadA));

        $response->assertOk()->assertJsonCount(1);
        $this->assertSame($reportA->id, $response->json('0.id'));
    }

    public function test_worker_sees_only_shared_reports(): void
    {
        [$locationA, ] = $this->makeLocationWithLead();
        $author = $this->createTenantUser(['role' => 'user']);
        $viewer = $this->createTenantUser(['role' => 'user']);
        $stranger = $this->createTenantUser(['role' => 'user']);

        $sharedReport = SecurityDailyReport::create(['report_date' => today(), 'created_by_user_id' => $author->id]);
        $sharedReport->locations()->attach($locationA->id);
        SecurityReportShare::create(['report_id' => $sharedReport->id, 'user_id' => $viewer->id]);

        $unsharedReport = SecurityDailyReport::create(['report_date' => today(), 'created_by_user_id' => $author->id]);
        $unsharedReport->locations()->attach($locationA->id);

        $response = $this->getJson($this->apiUrl('security-reports'), $this->authHeaders($viewer));

        $response->assertOk()->assertJsonCount(1);
        $this->assertSame($sharedReport->id, $response->json('0.id'));

        $this->getJson($this->apiUrl("security-reports/{$unsharedReport->id}"), $this->authHeaders($stranger))
            ->assertStatus(403);
    }

    #[DataProvider('creationPermissionCases')]
    public function test_security_report_creation_permission_matches_role(string $role, bool $expectAllowed): void
    {
        $user = $this->createTenantUser(['role' => $role]);

        // Szándékosan hiányos payload — csak a jogosultsági kaput teszteljük.
        $response = $this->postJson($this->apiUrl('security-reports'), [], $this->authHeaders($user));

        if ($expectAllowed) {
            $response->assertStatus(422);
        } else {
            $response->assertStatus(403);
        }
    }

    public static function creationPermissionCases(): array
    {
        return [
            'worker can create' => ['user', true],
            'admin can create' => ['admin', true],
            'director cannot create' => ['area_director', false],
            'security_lead cannot create' => ['security_lead', false],
            'property_manager cannot create' => ['property_manager', false],
        ];
    }

    public function test_security_lead_can_review_report_in_managed_location_but_not_others(): void
    {
        [$locationA, $leadA] = $this->makeLocationWithLead();
        [$locationB, ] = $this->makeLocationWithLead();
        $worker = $this->createTenantUser(['role' => 'user']);

        $ownReport = SecurityDailyReport::create(['report_date' => today(), 'created_by_user_id' => $worker->id]);
        $ownReport->locations()->attach($locationA->id);

        $otherReport = SecurityDailyReport::create(['report_date' => today(), 'created_by_user_id' => $worker->id]);
        $otherReport->locations()->attach($locationB->id);

        $this->postJson($this->apiUrl("security-reports/{$ownReport->id}/review"), [], $this->authHeaders($leadA))
            ->assertOk()
            ->assertJsonPath('reviewed_by_name', 'Lead A');

        $this->postJson($this->apiUrl("security-reports/{$otherReport->id}/review"), [], $this->authHeaders($leadA))
            ->assertStatus(403);
    }
}
