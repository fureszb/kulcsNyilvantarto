<?php

namespace App\Http\Controllers;

use App\Models\TenantUser;
use App\Models\VezenylesArea;
use App\Models\VezenylesChangelog;
use App\Models\VezenylesEmployee;
use App\Models\VezenylesOverride;
use App\Models\VezenylesSchedule;
use Illuminate\Http\Request;
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

    public function index(Request $request)
    {
        [$year, $month] = $this->currentYm($request);

        $areas = VezenylesArea::orderBy('name')->get(['id', 'name']);

        $employees = VezenylesEmployee::orderBy('name')
            ->get(['id', 'area_id', 'name', 'user_id']);

        $schedule = VezenylesSchedule::where('year', $year)
            ->where('month', $month)
            ->get(['employee_id', 'day', 'value']);

        $overrides = VezenylesOverride::where('year', $year)
            ->where('month', $month)
            ->get(['area_id', 'employee_id', 'day', 'slot', 'cover_employee_id', 'cover_area_id']);

        $changelog = VezenylesChangelog::orderByDesc('id')
            ->limit(200)
            ->get(['id', 'year', 'month', 'day', 'absent_employee', 'absent_area', 'cover_employee', 'cover_area', 'slot', 'action']);

        $users = TenantUser::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Vezenyles/Index', [
            'year'      => $year,
            'month'     => $month,
            'areas'     => $areas,
            'employees' => $employees,
            'schedule'  => $schedule,
            'overrides' => $overrides,
            'changelog' => $changelog,
            'users'     => $users,
        ]);
    }

    // ─── Területek ──────────────────────────────────────────────────────────
    public function storeArea(Request $request)
    {
        [$year, $month] = $this->currentYm($request);
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if (VezenylesArea::where('name', $data['name'])->exists()) {
            return $this->redirectBack($year, $month)->with('error', 'Ez a terület már létezik.');
        }

        VezenylesArea::create(['name' => trim($data['name'])]);
        return $this->redirectBack($year, $month)->with('success', 'Terület létrehozva.');
    }

    public function destroyArea(Request $request, int $area)
    {
        [$year, $month] = $this->currentYm($request);
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
