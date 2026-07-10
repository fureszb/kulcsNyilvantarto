<?php

namespace App\Http\Controllers\Api;

use App\Models\VezenylesArea;
use App\Models\VezenylesChangelog;
use App\Models\VezenylesEmployee;
use App\Models\VezenylesOverride;
use App\Models\VezenylesSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VezenylesController extends Controller
{
    private function currentYm(Request $request): array
    {
        $year = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);
        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }
        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }
        return [$year, $month];
    }

    /** Admin/területi igazgató mindent szerkeszthet; biztonsági vezető csak a
     *  managedLocations-jaihoz kötött területeket, más nem érintheti. */
    private function authorizeAreaAccess(int $areaId): void
    {
        $user = Auth::guard('tenant')->user();
        if ($user->hasAdminPowers()) {
            return;
        }
        if ($user->isSecurityLead()) {
            $area = VezenylesArea::find($areaId);
            $ok = $area && $area->location_id
                && $user->managedLocations()->where('locations.id', $area->location_id)->exists();
            abort_unless($ok, 403);
            return;
        }
        abort(403);
    }

    /** @return string|null|false  false = érvénytelen */
    private function normalizeValue(?string $raw)
    {
        if ($raw === null) {
            return null;
        }
        $t = trim($raw);
        if ($t === '') {
            return null;
        }
        if ($t === '?' || $t === '+') {
            return $t;
        }
        if (preg_match('/^x$/i', $t)) {
            return 'X';
        }
        $n = str_replace(',', '.', $t);
        if (is_numeric($n)) {
            $f = (float) $n;
            return $f == (int) $f ? (string) (int) $f : (string) $f;
        }
        return false;
    }

    public function index(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $user = $request->user();
        abort_if($user->isPropertyManager(), 403);

        $canEdit = $user->hasAdminPowers() || $user->isSecurityLead();

        $areasQuery = VezenylesArea::orderBy('name');

        if (!$user->hasAdminPowers()) {
            $locationIds = $user->isSecurityLead()
                ? $user->managedLocations()->pluck('locations.id')
                : $user->workLocations()->pluck('locations.id');
            $areasQuery->whereIn('location_id', $locationIds);
        }

        $areas = $areasQuery->get(['id', 'name', 'location_id']);
        $areaIds = $areas->pluck('id');
        $areaNames = $areas->pluck('name');

        $employees = VezenylesEmployee::whereIn('area_id', $areaIds)->orderBy('name')
            ->get(['id', 'area_id', 'name', 'user_id']);
        $employeeIds = $employees->pluck('id');

        $schedule = VezenylesSchedule::whereIn('employee_id', $employeeIds)
            ->where('year', $year)->where('month', $month)
            ->get(['employee_id', 'day', 'value']);

        $overrides = VezenylesOverride::whereIn('area_id', $areaIds)
            ->where('year', $year)->where('month', $month)
            ->get(['area_id', 'employee_id', 'day', 'slot', 'cover_employee_id', 'cover_area_id']);

        $changelogQuery = VezenylesChangelog::orderByDesc('id')->limit(200);
        if (!$user->hasAdminPowers()) {
            $changelogQuery->whereIn('absent_area', $areaNames);
        }
        $changelog = $changelogQuery
            ->get(['id', 'year', 'month', 'day', 'absent_employee', 'absent_area', 'cover_employee', 'cover_area', 'slot', 'action']);

        return response()->json([
            'year'      => $year,
            'month'     => $month,
            'areas'     => $areas,
            'employees' => $employees,
            'schedule'  => $schedule,
            'overrides' => $overrides,
            'changelog' => $changelog,
            'can_edit'  => $canEdit,
        ]);
    }

    public function upsertSchedule(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|integer|exists:tenant.vezenyles_employees,id',
            'year'        => 'required|integer|min:2000|max:2100',
            'month'       => 'required|integer|min:1|max:12',
            'day'         => 'required|integer|min:1|max:31',
            'value'       => 'nullable|string|max:10',
        ]);

        $emp = VezenylesEmployee::findOrFail($data['employee_id']);
        $currentUser = $request->user();

        if (!($emp->user_id && $emp->user_id === $currentUser->id)) {
            $this->authorizeAreaAccess($emp->area_id);
        }

        $value = $this->normalizeValue($data['value'] ?? null);
        if ($value === false) {
            return response()->json([
                'message' => 'Érvénytelen érték. Csak szám, X, ? vagy + adható meg.',
                'errors'  => ['value' => ['Érvénytelen érték. Csak szám, X, ? vagy + adható meg.']],
            ], 422);
        }

        if ($value === null) {
            VezenylesSchedule::where('employee_id', $data['employee_id'])
                ->where('year', $data['year'])->where('month', $data['month'])->where('day', $data['day'])
                ->delete();
        } else {
            VezenylesSchedule::updateOrCreate(
                [
                    'employee_id' => $data['employee_id'],
                    'year'        => $data['year'],
                    'month'       => $data['month'],
                    'day'         => $data['day'],
                ],
                ['value' => $value]
            );
        }

        return response()->json([
            'employee_id' => $data['employee_id'],
            'day'         => $data['day'],
            'value'       => $value,
        ]);
    }

    public function assignCover(Request $request)
    {
        $data = $request->validate([
            'area_id'           => 'required|integer',
            'employee_id'       => 'required|integer',
            'year'              => 'required|integer|min:2000|max:2100',
            'month'             => 'required|integer|min:1|max:12',
            'day'               => 'required|integer|min:1|max:31',
            'slot'              => 'required|in:day,night',
            'cover_employee_id' => 'required|integer|exists:tenant.vezenyles_employees,id',
            'cover_area_id'     => 'required|integer|exists:tenant.vezenyles_areas,id',
        ]);

        $this->authorizeAreaAccess($data['area_id']);

        VezenylesOverride::updateOrCreate(
            [
                'area_id'     => $data['area_id'],
                'employee_id' => $data['employee_id'],
                'year'        => $data['year'],
                'month'       => $data['month'],
                'day'         => $data['day'],
                'slot'        => $data['slot'],
            ],
            [
                'cover_employee_id' => $data['cover_employee_id'],
                'cover_area_id'     => $data['cover_area_id'],
            ]
        );

        $absent = VezenylesEmployee::find($data['employee_id']);
        $absentArea = VezenylesArea::find($data['area_id']);
        $cover = VezenylesEmployee::find($data['cover_employee_id']);
        $coverArea = VezenylesArea::find($data['cover_area_id']);

        VezenylesChangelog::create([
            'year'            => $data['year'],
            'month'           => $data['month'],
            'day'             => $data['day'],
            'absent_employee' => $absent?->name,
            'absent_area'     => $absentArea?->name,
            'cover_employee'  => $cover?->name,
            'cover_area'      => $coverArea?->name,
            'slot'            => $data['slot'],
            'action'          => 'assign',
            'created_at'      => now(),
        ]);

        return response()->json(['message' => 'Pótlás rögzítve.'], 201);
    }

    public function removeCover(Request $request)
    {
        $data = $request->validate([
            'area_id'     => 'required|integer',
            'employee_id' => 'required|integer',
            'year'        => 'required|integer|min:2000|max:2100',
            'month'       => 'required|integer|min:1|max:12',
            'day'         => 'required|integer|min:1|max:31',
            'slot'        => 'required|in:day,night',
        ]);

        $this->authorizeAreaAccess($data['area_id']);

        $existing = VezenylesOverride::where('area_id', $data['area_id'])
            ->where('employee_id', $data['employee_id'])
            ->where('year', $data['year'])->where('month', $data['month'])
            ->where('day', $data['day'])->where('slot', $data['slot'])
            ->first();

        if (!$existing) {
            return response()->noContent();
        }

        $absent = VezenylesEmployee::find($data['employee_id']);
        $absentArea = VezenylesArea::find($data['area_id']);
        $cover = VezenylesEmployee::find($existing->cover_employee_id);

        $existing->delete();

        VezenylesChangelog::create([
            'year'            => $data['year'],
            'month'           => $data['month'],
            'day'             => $data['day'],
            'absent_employee' => $absent?->name,
            'absent_area'     => $absentArea?->name,
            'cover_employee'  => $cover?->name,
            'cover_area'      => null,
            'slot'            => $data['slot'],
            'action'          => 'undo',
            'created_at'      => now(),
        ]);

        return response()->noContent();
    }
}
