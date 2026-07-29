<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Location;
use App\Models\TenantUser;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * A `DocumentController` szerepkör-alapú láthatósági/jogosultsági szabályait fedi le — ez a
 * legfinomabb, legkönnyebben visszafejleszthető logika a kódbázisban (2026-07-17-i audit
 * több hibát is talált itt), ezért érdemel dedikált regresszió-védelmet.
 */
class DocumentVisibilityTest extends TenantTestCase
{
    private function makeLocationWithLead(): array
    {
        $lead = $this->createTenantUser(['role' => 'security_lead', 'name' => 'Lead A']);
        // `security_lead_id` szándékosan nincs a Location::$fillable-ben (tömeges hozzárendelés
        // ellen védve), ezért közvetlen attribútum-beállítással, nem create()-tel kötjük be.
        $location = Location::create(['name' => 'Location A']);
        $location->security_lead_id = $lead->id;
        $location->save();

        return [$location, $lead];
    }

    public function test_worker_sees_only_own_documents_in_index(): void
    {
        [$location] = $this->makeLocationWithLead();
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);
        $otherWorker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);

        Document::create(['document_type' => 'feljegyzeses_jegyzokonyv', 'location_id' => $location->id, 'created_by_user_id' => $worker->id]);
        Document::create(['document_type' => 'feljegyzeses_jegyzokonyv', 'location_id' => $location->id, 'created_by_user_id' => $otherWorker->id]);

        $response = $this->getJson($this->apiUrl('documents'), $this->authHeaders($worker));

        $response->assertOk();
        $this->assertCount(1, $response->json());
        $this->assertSame($worker->id, $response->json('0.created_by_user_id'));
    }

    public function test_security_lead_sees_only_team_documents_in_index(): void
    {
        [$locationA, $leadA] = $this->makeLocationWithLead();
        [$locationB, $leadB] = $this->makeLocationWithLead();
        $workerA = $this->createTenantUser(['role' => 'user', 'location_id' => $locationA->id]);
        $workerB = $this->createTenantUser(['role' => 'user', 'location_id' => $locationB->id]);

        Document::create(['document_type' => 'karfelveteli_jegyzokonyv', 'location_id' => $locationA->id, 'created_by_user_id' => $workerA->id]);
        Document::create(['document_type' => 'karfelveteli_jegyzokonyv', 'location_id' => $locationB->id, 'created_by_user_id' => $workerB->id]);

        $response = $this->getJson($this->apiUrl('documents'), $this->authHeaders($leadA));

        $response->assertOk();
        $this->assertCount(1, $response->json());
        $this->assertSame($workerA->id, $response->json('0.created_by_user_id'));
    }

    public function test_director_sees_all_documents_in_index(): void
    {
        [$locationA] = $this->makeLocationWithLead();
        [$locationB] = $this->makeLocationWithLead();
        $workerA = $this->createTenantUser(['role' => 'user', 'location_id' => $locationA->id]);
        $workerB = $this->createTenantUser(['role' => 'user', 'location_id' => $locationB->id]);
        $director = $this->createTenantUser(['role' => 'area_director']);

        Document::create(['document_type' => 'talalt_targy_jegyzokonyv', 'location_id' => $locationA->id, 'created_by_user_id' => $workerA->id]);
        Document::create(['document_type' => 'talalt_targy_jegyzokonyv', 'location_id' => $locationB->id, 'created_by_user_id' => $workerB->id]);

        $response = $this->getJson($this->apiUrl('documents'), $this->authHeaders($director));

        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    public function test_property_manager_sees_all_documents_in_index(): void
    {
        [$locationA] = $this->makeLocationWithLead();
        $workerA = $this->createTenantUser(['role' => 'user', 'location_id' => $locationA->id]);
        $pm = $this->createTenantUser(['role' => 'property_manager']);

        Document::create(['document_type' => 'robbantasi_fenyegetes', 'location_id' => $locationA->id, 'created_by_user_id' => $workerA->id]);

        $response = $this->getJson($this->apiUrl('documents'), $this->authHeaders($pm));

        $response->assertOk();
        $this->assertCount(1, $response->json());
    }

    #[DataProvider('creationPermissionCases')]
    public function test_document_creation_permission_matches_role(string $role, bool $expectAllowed): void
    {
        $user = $this->createTenantUser(['role' => $role]);

        // Szándékosan hiányos payload — csak a jogosultsági kaput teszteljük
        // (`abort_unless($user->canCreateDocuments())`), ami a validáció ELŐTT fut le.
        $response = $this->postJson($this->apiUrl('documents/incident-reports'), [], $this->authHeaders($user));

        if ($expectAllowed) {
            $response->assertStatus(422); // átjutott a jogosultsági kapun, a validáción bukott el
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

    public function test_security_lead_can_review_own_team_document_but_not_others(): void
    {
        [$locationA, $leadA] = $this->makeLocationWithLead();
        [$locationB] = $this->makeLocationWithLead();
        $workerA = $this->createTenantUser(['role' => 'user', 'location_id' => $locationA->id]);
        $workerB = $this->createTenantUser(['role' => 'user', 'location_id' => $locationB->id]);

        $ownTeamDoc = Document::create(['document_type' => 'feljegyzeses_jegyzokonyv', 'location_id' => $locationA->id, 'created_by_user_id' => $workerA->id]);
        $otherTeamDoc = Document::create(['document_type' => 'feljegyzeses_jegyzokonyv', 'location_id' => $locationB->id, 'created_by_user_id' => $workerB->id]);

        $this->postJson($this->apiUrl("documents/{$ownTeamDoc->id}/review"), [], $this->authHeaders($leadA))
            ->assertOk()
            ->assertJsonPath('reviewed_by_name', 'Lead A');

        $this->postJson($this->apiUrl("documents/{$otherTeamDoc->id}/review"), [], $this->authHeaders($leadA))
            ->assertStatus(403);
    }

    public function test_worker_cannot_review_documents(): void
    {
        [$location] = $this->makeLocationWithLead();
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);
        $document = Document::create(['document_type' => 'feljegyzeses_jegyzokonyv', 'location_id' => $location->id, 'created_by_user_id' => $worker->id]);

        $this->postJson($this->apiUrl("documents/{$document->id}/review"), [], $this->authHeaders($worker))
            ->assertStatus(403);
    }
}
