<?php

namespace App\Http\Controllers\Api\Documents\Concerns;

use App\Jobs\SendNativePushJob;
use App\Jobs\SendPushJob;
use App\Models\Document;
use App\Models\Location;
use App\Models\TenantUser;

/** Új rendellenességet rögzítő dokumentum (feljegyzéses jegyzőkönyv, kárfelvétel, talált tárgy,
 *  robbantási fenyegetés) létrehozásakor értesíti az érintett irodaház felelőseit — biztonsági
 *  vezető, Property Manager, és a biztonsági vezető felettese (területi igazgató) — ugyanaz a
 *  "ki a felelős ezért az irodaházért" minta, mint `NfcAccessController::notifyBosses()`. */
trait NotifiesIssueDocument
{
    private function notifyIssueDocumentCreated(Document $document, TenantUser $creator): void
    {
        if (!$document->location_id) {
            return;
        }

        $location = Location::find($document->location_id);
        if (!$location) {
            return;
        }

        $recipientIds = collect([$location->security_lead_id])
            ->push(optional(TenantUser::find($location->security_lead_id))?->director_id)
            ->push($location->propertyManager?->id)
            ->filter()
            ->unique()
            ->values();

        if ($recipientIds->isEmpty()) {
            return;
        }

        $tenant = app('tenant');
        if (!$tenant?->slug) {
            return;
        }

        SendPushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: $recipientIds->all(),
            title: 'Új ' . mb_strtolower($document->typeLabel()),
            body: "{$creator->name} rögzítette — {$location->name}",
            url: route('documents.show', $document),
            tag: 'document-issue',
        );
        SendNativePushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: $recipientIds->all(),
            title: 'Új ' . mb_strtolower($document->typeLabel()),
            body: "{$creator->name} rögzítette — {$location->name}",
            url: route('documents.show', $document),
            tag: 'document-issue',
        );
    }
}
