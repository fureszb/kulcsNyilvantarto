<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\Documents\IncidentReportController;
use App\Jobs\SendNativePushJob;
use App\Jobs\SendPushJob;
use App\Models\Check;
use App\Models\Document;
use App\Models\Location;
use App\Models\Tenant;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\URL;

/**
 * A 2026-07-17-i audit során hozzáadott push/dashboard funkciók regressziós védelme:
 * új "rendellenesség" dokumentum értesítése (web + natív push), és a "ma még nem ellenőrzött
 * telephely" dashboard-jelzés. (A kapacitás-elérési riasztás 2026-07-18-án megszűnt — lásd
 * `NfcAndPresenceTest`.)
 */
class NotificationAndDashboardTest extends TenantTestCase
{
    public function test_issue_document_creation_notifies_lead_pm_and_director_via_both_push_channels(): void
    {
        Queue::fake();

        $director = $this->createTenantUser(['role' => 'area_director', 'name' => 'Director D']);
        $lead = $this->createTenantUser(['role' => 'security_lead', 'name' => 'Lead L', 'director_id' => $director->id]);
        $location = Location::create(['name' => 'Office X']);
        $location->security_lead_id = $lead->id;
        $location->save();
        $pm = $this->createTenantUser(['role' => 'property_manager', 'location_id' => $location->id, 'name' => 'PM P']);
        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $location->id]);

        $document = Document::create([
            'document_type'      => 'feljegyzeses_jegyzokonyv',
            'location_id'        => $location->id,
            'created_by_user_id' => $worker->id,
        ]);

        // A trait `route('documents.show', $document)`-et hív, aminek szüksége van a
        // `{tenant}` URL-paraméterre — HTTP-kérésen kívül (mint itt) ezt a `TenantMiddleware`
        // helyett nekünk kell pótolnunk (`URL::defaults` + `app()->instance('tenant', ...)`).
        $tenant = Tenant::where('slug', $this->tenantSlug)->firstOrFail();
        app()->instance('tenant', $tenant);
        URL::defaults(['tenant' => $this->tenantSlug]);

        $controller = new IncidentReportController();
        $method = new \ReflectionMethod($controller, 'notifyIssueDocumentCreated');
        $method->setAccessible(true);
        $method->invoke($controller, $document, $worker);

        $expectedRecipients = fn ($job) =>
            in_array($lead->id, $job->userIds, true)
            && in_array($pm->id, $job->userIds, true)
            && in_array($director->id, $job->userIds, true);

        Queue::assertPushed(SendPushJob::class, $expectedRecipients);
        Queue::assertPushed(SendNativePushJob::class, $expectedRecipients);
    }

    /** A kapacitás-elérési push (`notifyIfCapacityReached`) 2026-07-18-án megszűnt: a rendszer
     *  nem beléptető/kiléptető kapu, NFC-scanből nem lehet "hányan vannak bent" számot vezetni
     *  (lásd `NfcAndPresenceTest::test_scanning_two_checkpoints_at_same_location_are_both_checked`). */
    public function test_dashboard_flags_only_locations_with_no_checks_today(): void
    {
        $lead = $this->createTenantUser(['role' => 'security_lead']);
        $checkedLocation = Location::create(['name' => 'Checked Office']);
        $checkedLocation->security_lead_id = $lead->id;
        $checkedLocation->save();
        $uncheckedLocation = Location::create(['name' => 'Unchecked Office']);
        $uncheckedLocation->security_lead_id = $lead->id;
        $uncheckedLocation->save();

        $worker = $this->createTenantUser(['role' => 'user', 'location_id' => $checkedLocation->id]);
        Check::create(['location_id' => $checkedLocation->id, 'user_id' => $worker->id, 'checked_by' => $worker->name]);

        $response = $this->getJson($this->apiUrl('security-lead/dashboard'), $this->authHeaders($lead));

        $response->assertOk();
        $this->assertSame(['Unchecked Office'], $response->json('not_checked_today_locations'));
    }
}
