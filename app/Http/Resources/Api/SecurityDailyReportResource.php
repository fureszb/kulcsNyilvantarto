<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\SecurityDailyReport */
class SecurityDailyReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'report_date'             => optional($this->report_date)->toDateString(),
            'service_members'         => $this->service_members ?? [],
            'previous_shift_members'  => $this->previous_shift_members ?? [],
            'taken_over_from'         => $this->taken_over_from,
            'handover_time'           => $this->handover_time,
            'cc_recipients'           => $this->cc_recipients ?? [],
            'equipment'               => $this->equipment ?? [],
            'inspectors'              => $this->inspectors ?? [],
            'patrols'                 => $this->patrols ?? [],
            'incidents'               => $this->incidents ?? [],
            'events'                  => $this->events ?? [],
            'fire_alarms'             => $this->fire_alarms ?? [],
            'elevators'               => $this->elevators ?? [],
            'maintenance'             => $this->maintenance ?? [],
            'prepared_by'             => $this->prepared_by,
            'created_by_user_id'      => $this->created_by_user_id,
            'location_ids'            => $this->whenLoaded('locations', fn () => $this->locations->pluck('id')->values()),
            'share_user_ids'          => $this->whenLoaded('shares', fn () => $this->shares->pluck('user_id')->values()),
            'created_at'              => optional($this->created_at)->toIso8601String(),
        ];
    }
}
