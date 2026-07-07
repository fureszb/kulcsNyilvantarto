<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\TenantUser;
use App\Models\VezenylesArea;
use App\Models\VezenylesChangelog;
use App\Models\VezenylesEmployee;
use App\Models\VezenylesOverride;
use App\Models\VezenylesSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VezenylesController extends Controller
{
    private function currentYm(Request $request): array
    {
        $year  = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);
        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }
        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }
        return [$year, $month];
    }

    private function redirectBack(int $year, int $month)
    {
        return redirect()->route('vezenyles.index', ['year' => $year, 'month' => $month]);
    }

    /** Admin/területi igazgató mindent lát/szerkeszthet; biztonsági vezető csak a
     *  managedLocations-jaihoz kötött területeket szerkesztheti, mást nem lát/érinthet. */
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

    public function index(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $user = Auth::guard('tenant')->user();
        abort_if($user->isPropertyManager(), 403);

        $canEdit = $user->hasAdminPowers() || $user->isSecurityLead();

        $areasQuery = VezenylesArea::orderBy('name');
        $assignableLocations = null;

        if (!$user->hasAdminPowers()) {
            if ($user->isSecurityLead()) {
                $locationIds = $user->managedLocations()->pluck('locations.id');
                $assignableLocations = $user->managedLocations()->orderBy('name')->get(['locations.id', 'locations.name']);
            } else {
                $locationIds = $user->workLocations()->pluck('locations.id');
            }
            $areasQuery->whereIn('location_id', $locationIds);
        } else {
            $assignableLocations = Location::orderBy('name')->get(['id', 'name']);
        }

        $areas = $areasQuery->get(['id', 'name', 'location_id']);
        $areaIds = $areas->pluck('id');
        $areaNames = $areas->pluck('name');

        $employees = VezenylesEmployee::whereIn('area_id', $areaIds)->orderBy('name')
            ->get(['id', 'area_id', 'name', 'user_id']);
        $employeeIds = $employees->pluck('id');

        $schedule = VezenylesSchedule::whereIn('employee_id', $employeeIds)
            ->where('year', $year)
            ->where('month', $month)
            ->get(['employee_id', 'day', 'value']);

        $overrides = VezenylesOverride::whereIn('area_id', $areaIds)
            ->where('year', $year)
            ->where('month', $month)
            ->get(['area_id', 'employee_id', 'day', 'slot', 'cover_employee_id', 'cover_area_id']);

        $changelogQuery = VezenylesChangelog::orderByDesc('id')->limit(200);
        if (!$user->hasAdminPowers()) {
            $changelogQuery->whereIn('absent_area', $areaNames);
        }
        $changelog = $changelogQuery
            ->get(['id', 'year', 'month', 'day', 'absent_employee', 'absent_area', 'cover_employee', 'cover_area', 'slot', 'action']);

        $users = TenantUser::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Vezenyles/Index', [
            'year'                 => $year,
            'month'                => $month,
            'areas'                => $areas,
            'employees'            => $employees,
            'schedule'             => $schedule,
            'overrides'            => $overrides,
            'changelog'            => $changelog,
            'users'                => $users,
            'canEdit'              => $canEdit,
            'canImport'            => $user->hasAdminPowers(),
            'assignableLocations'  => $assignableLocations,
        ]);
    }

    // ─── Területek ──────────────────────────────────────────────────────────
    public function storeArea(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $user = Auth::guard('tenant')->user();
        abort_unless($user->hasAdminPowers() || $user->isSecurityLead(), 403);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'location_id' => 'nullable|integer|exists:tenant.locations,id',
        ]);

        if ($user->isSecurityLead()) {
            abort_unless($data['location_id'] ?? null, 422, 'A terület létrehozásához irodaházat kell választani.');
            abort_unless($user->managedLocations()->where('locations.id', $data['location_id'])->exists(), 403);
        }

        if (VezenylesArea::where('name', $data['name'])->exists()) {
            return $this->redirectBack($year, $month)->with('error', 'Ez a terület már létezik.');
        }

        VezenylesArea::create(['name' => trim($data['name']), 'location_id' => $data['location_id'] ?? null]);
        return $this->redirectBack($year, $month)->with('success', 'Terület létrehozva.');
    }

    public function updateArea(Request $request, int $area)
    {
        [$year, $month] = $this->currentYm($request);
        $this->authorizeAreaAccess($area);
        $areaModel = VezenylesArea::findOrFail($area);
        $user = Auth::guard('tenant')->user();

        $data = $request->validate([
            'location_id' => 'nullable|integer|exists:tenant.locations,id',
        ]);

        if ($user->isSecurityLead()) {
            abort_unless($data['location_id'] ?? null, 422, 'A területhez irodaházat kell választani.');
            abort_unless($user->managedLocations()->where('locations.id', $data['location_id'])->exists(), 403);
        }

        $areaModel->update(['location_id' => $data['location_id'] ?? null]);

        return $this->redirectBack($year, $month)->with('success', 'Terület frissítve.');
    }

    public function destroyArea(Request $request, int $area)
    {
        [$year, $month] = $this->currentYm($request);
        $this->authorizeAreaAccess($area);
        $areaModel = VezenylesArea::findOrFail($area);

        DB::connection('tenant')->transaction(function () use ($areaModel) {
            // A schedule és employees a cascade miatt törlődik; az override-ok
            // area_id / cover_area_id hivatkozásait külön takarítjuk.
            VezenylesOverride::where('area_id', $areaModel->id)
                ->orWhere('cover_area_id', $areaModel->id)
                ->delete();
            $areaModel->delete();
        });

        return $this->redirectBack($year, $month)->with('success', 'Terület törölve.');
    }

    // ─── Dolgozók ───────────────────────────────────────────────────────────
    public function storeEmployee(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $data = $request->validate([
            'area_id' => 'required|integer|exists:tenant.vezenyles_areas,id',
            'name'    => 'required|string|max:255',
            'user_id' => 'nullable|integer|exists:tenant.users,id',
        ]);

        $this->authorizeAreaAccess($data['area_id']);

        $exists = VezenylesEmployee::where('area_id', $data['area_id'])
            ->where('name', trim($data['name']))
            ->exists();
        if ($exists) {
            return $this->redirectBack($year, $month)->with('error', 'Ezen a területen már van ilyen nevű dolgozó.');
        }

        VezenylesEmployee::create([
            'area_id' => $data['area_id'],
            'name'    => trim($data['name']),
            'user_id' => $data['user_id'] ?? null,
        ]);

        return $this->redirectBack($year, $month)->with('success', 'Dolgozó hozzáadva.');
    }

    public function destroyEmployee(Request $request, int $employee)
    {
        [$year, $month] = $this->currentYm($request);
        $emp = VezenylesEmployee::findOrFail($employee);
        $this->authorizeAreaAccess($emp->area_id);

        DB::connection('tenant')->transaction(function () use ($emp) {
            VezenylesOverride::where('employee_id', $emp->id)
                ->orWhere('cover_employee_id', $emp->id)
                ->delete();
            $emp->delete(); // schedule cascade
        });

        return $this->redirectBack($year, $month)->with('success', 'Dolgozó törölve.');
    }

    // ─── Beosztás cella ─────────────────────────────────────────────────────
    public function upsertSchedule(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $data = $request->validate([
            'employee_id' => 'required|integer|exists:tenant.vezenyles_employees,id',
            'day'         => 'required|integer|min:1|max:31',
            'value'       => 'nullable|string|max:10',
        ]);

        $emp = VezenylesEmployee::findOrFail($data['employee_id']);
        $currentUser = Auth::guard('tenant')->user();
        // A saját sorát (tervezés — mikor tud jönni) bárki szerkesztheti, akire rá
        // van kötve az employee-sor; más soraihoz csak admin/igazgató/biztonsági
        // vezető nyúlhat (authorizeAreaAccess).
        if (!($emp->user_id && $emp->user_id === $currentUser->id)) {
            $this->authorizeAreaAccess($emp->area_id);
        }

        $value = $this->normalizeValue($data['value'] ?? null);
        if ($value === false) {
            return $this->redirectBack($year, $month)->with('error', 'Érvénytelen érték. Csak szám, X, ? vagy + adható meg.');
        }

        if ($value === null) {
            VezenylesSchedule::where('employee_id', $data['employee_id'])
                ->where('year', $year)->where('month', $month)->where('day', $data['day'])
                ->delete();
        } else {
            VezenylesSchedule::updateOrCreate(
                [
                    'employee_id' => $data['employee_id'],
                    'year'        => $year,
                    'month'       => $month,
                    'day'         => $data['day'],
                ],
                ['value' => $value]
            );
        }

        return $this->redirectBack($year, $month);
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
            // egész számként tároljuk, ha az (pl. "24"), különben ahogy jött
            $f = (float) $n;
            return $f == (int) $f ? (string) (int) $f : (string) $f;
        }
        return false;
    }

    // ─── Pótlás (override) ──────────────────────────────────────────────────
    public function assignCover(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $data = $request->validate([
            'area_id'           => 'required|integer',
            'employee_id'       => 'required|integer',
            'day'               => 'required|integer|min:1|max:31',
            'slot'              => 'required|in:night,day',
            'cover_employee_id' => 'required|integer|exists:tenant.vezenyles_employees,id',
            'cover_area_id'     => 'required|integer|exists:tenant.vezenyles_areas,id',
        ]);

        $this->authorizeAreaAccess($data['area_id']);

        VezenylesOverride::updateOrCreate(
            [
                'area_id'     => $data['area_id'],
                'employee_id' => $data['employee_id'],
                'year'        => $year,
                'month'       => $month,
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
            'year'            => $year,
            'month'           => $month,
            'day'             => $data['day'],
            'absent_employee' => $absent?->name,
            'absent_area'     => $absentArea?->name,
            'cover_employee'  => $cover?->name,
            'cover_area'      => $coverArea?->name,
            'slot'            => $data['slot'],
            'action'          => 'assign',
            'created_at'      => now(),
        ]);

        return $this->redirectBack($year, $month)->with('success', 'Pótlás rögzítve.');
    }

    public function removeCover(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $data = $request->validate([
            'area_id'     => 'required|integer',
            'employee_id' => 'required|integer',
            'day'         => 'required|integer|min:1|max:31',
            'slot'        => 'required|in:night,day',
        ]);

        $this->authorizeAreaAccess($data['area_id']);

        $existing = VezenylesOverride::where('area_id', $data['area_id'])
            ->where('employee_id', $data['employee_id'])
            ->where('year', $year)->where('month', $month)
            ->where('day', $data['day'])->where('slot', $data['slot'])
            ->first();

        if (!$existing) {
            return $this->redirectBack($year, $month);
        }

        $absent = VezenylesEmployee::find($data['employee_id']);
        $absentArea = VezenylesArea::find($data['area_id']);
        $cover = VezenylesEmployee::find($existing->cover_employee_id);

        $existing->delete();

        VezenylesChangelog::create([
            'year'            => $year,
            'month'           => $month,
            'day'             => $data['day'],
            'absent_employee' => $absent?->name,
            'absent_area'     => $absentArea?->name,
            'cover_employee'  => $cover?->name,
            'cover_area'      => null,
            'slot'            => $data['slot'],
            'action'          => 'undo',
            'created_at'      => now(),
        ]);

        return $this->redirectBack($year, $month)->with('success', 'Pótlás visszavonva.');
    }

    // ─── Régi Excel import (kliens oldalon parse-olt JSON) ──────────────────
    public function import(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        abort_unless(Auth::guard('tenant')->user()->hasAdminPowers(), 403);

        $data = $request->validate([
            'import_year'                     => 'required|integer|min:2000|max:2100',
            'sheets'                          => 'required|array|min:1',
            'sheets.*.area'                   => 'required|string|max:255',
            'sheets.*.month'                  => 'required|integer|min:1|max:12',
            'sheets.*.employees'              => 'required|array',
            'sheets.*.employees.*.name'       => 'required|string|max:255',
            'sheets.*.employees.*.cells'      => 'array',
        ]);

        $importYear = (int) $data['import_year'];
        $imported = 0;

        DB::connection('tenant')->transaction(function () use ($data, $importYear, &$imported) {
            foreach ($data['sheets'] as $sheet) {
                $area = VezenylesArea::firstOrCreate(['name' => trim($sheet['area'])]);
                $sheetMonth = (int) $sheet['month'];

                foreach ($sheet['employees'] as $emp) {
                    $empName = trim($emp['name']);
                    if ($empName === '') {
                        continue;
                    }
                    $employee = VezenylesEmployee::firstOrCreate(
                        ['area_id' => $area->id, 'name' => $empName]
                    );

                    foreach (($emp['cells'] ?? []) as $dayStr => $val) {
                        $day = (int) $dayStr;
                        if ($day < 1 || $day > 31) {
                            continue;
                        }
                        $value = $this->normalizeValue($val === null ? null : (string) $val);
                        if ($value === false || $value === null) {
                            continue;
                        }
                        VezenylesSchedule::updateOrCreate(
                            [
                                'employee_id' => $employee->id,
                                'year'        => $importYear,
                                'month'       => $sheetMonth,
                                'day'         => $day,
                            ],
                            ['value' => $value]
                        );
                        $imported++;
                    }
                }
            }
        });

        return $this->redirectBack($year, $month)
            ->with('success', "Import kész: {$imported} beosztás-cella feldolgozva.");
    }
}
