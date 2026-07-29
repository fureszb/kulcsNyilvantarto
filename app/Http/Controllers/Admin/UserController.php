<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Location;
use App\Models\TenantUser;
use App\Models\UserExamOverride;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    private const ROLES = ['admin', 'user', 'property_manager', 'security_lead', 'area_director'];

    public function index()
    {
        $users = TenantUser::orderBy('role')->orderBy('name')->get();
        return Inertia::render('Admin/Users/Index', ['users' => $users]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Form', [
            'user'  => null,
            'roles' => self::ROLES,
            'assignableLocations'  => Location::orderBy('name')->get(['id', 'name']),
            'assignableLeads'      => $this->securityLeads(),
            'assignableDirectors'  => $this->areaDirectors(),
            'assignedNfcLocationIds' => collect(),
        ]);
    }

    /** A hozzárendeléshez választható biztonsági vezetők (area_director-hoz). */
    private function securityLeads()
    {
        return TenantUser::where('role', 'security_lead')->orderBy('name')->get(['id', 'name']);
    }

    /** A hozzárendeléshez választható területi igazgatók (security_lead-hez). */
    private function areaDirectors()
    {
        return TenantUser::where('role', 'area_director')->orderBy('name')->get(['id', 'name']);
    }

    /** A role-váltáshoz igazított hozzárendelés — N:1/1:1 (ER-diagram szerint). */
    private function syncAssignments(TenantUser $user, Request $request): void
    {
        $singleLocationId = $request->filled('location_id') ? (int) $request->input('location_id') : null;
        $locationIds      = collect($request->input('location_ids', []))->map(fn ($id) => (int) $id)->all();
        $directorId       = $request->filled('director_id') ? (int) $request->input('director_id') : null;
        $leadIds          = collect($request->input('lead_ids', []))->map(fn ($id) => (int) $id)->all();

        // Dolgozó/PM → EGY irodaház (users.location_id); más role-nál üres.
        $user->update([
            'location_id' => in_array($user->role, ['user', 'property_manager']) ? $singleLocationId : null,
            'director_id' => $user->role === 'security_lead' ? $directorId : null,
        ]);

        // Biztonsági vezető → irodaházak, amikért felel (locations.security_lead_id,
        // 1:N a vezető oldaláról — a kiválasztottakat ráállítjuk, a többiről levesszük).
        if ($user->role === 'security_lead') {
            Location::whereIn('id', $locationIds)->update(['security_lead_id' => $user->id]);
            Location::where('security_lead_id', $user->id)->whereNotIn('id', $locationIds)->update(['security_lead_id' => null]);
        } else {
            Location::where('security_lead_id', $user->id)->update(['security_lead_id' => null]);
        }

        // Területi igazgató → felügyelt biztonsági vezetők (users.director_id).
        if ($user->role === 'area_director') {
            TenantUser::whereIn('id', $leadIds)->where('role', 'security_lead')->update(['director_id' => $user->id]);
            TenantUser::where('director_id', $user->id)->whereNotIn('id', $leadIds)->update(['director_id' => null]);
        } else {
            TenantUser::where('director_id', $user->id)->update(['director_id' => null]);
        }

        // NFC beléptetési jogosultság — szerepkörtől független, explicit lista.
        $nfcLocationIds = collect($request->input('nfc_location_ids', []))->map(fn ($id) => (int) $id)->all();
        $user->nfcLocations()->sync($nfcLocationIds);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => ['required', 'email', 'max:255', Rule::unique(TenantUser::class)],
            'password'       => 'required|string|min:8|confirmed',
            'role'           => ['required', Rule::in(self::ROLES)],
            'employed_since' => 'nullable|date',
            'left_at'        => 'nullable|date',
            'location_id'    => 'nullable|integer',
            'location_ids'   => 'nullable|array',
            'location_ids.*' => 'integer',
            'director_id'    => 'nullable|integer',
            'lead_ids'       => 'nullable|array',
            'lead_ids.*'     => 'integer',
            'nfc_location_ids'   => 'nullable|array',
            'nfc_location_ids.*' => 'integer',
        ]);

        $user = TenantUser::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'password'       => Hash::make($validated['password']),
            'role'           => $validated['role'],
            'is_active'      => $request->boolean('is_active', true),
            'employed_since' => $validated['employed_since'] ?? null,
            'left_at'        => $validated['left_at'] ?? null,
        ]);

        $this->syncAssignments($user, $request);

        return redirect()->route('admin.users.index')->with('success', 'Felhasználó sikeresen létrehozva!');
    }

    public function edit(TenantUser $user)
    {
        $exams     = Exam::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get(['id', 'title', 'max_attempts']);
        $overrides = UserExamOverride::where('user_id', $user->id)->get()->keyBy('exam_id');

        return Inertia::render('Admin/Users/Form', [
            'user'      => $user,
            'roles'     => self::ROLES,
            'exams'     => $exams,
            'overrides' => $overrides->map(fn($o) => ['exam_id' => $o->exam_id, 'max_attempts' => $o->max_attempts])->values(),
            'assignableLocations' => Location::orderBy('name')->get(['id', 'name']),
            'assignableLeads'     => $this->securityLeads(),
            'assignableDirectors' => $this->areaDirectors(),
            // A user aktuális hozzárendelései (role-tól függően használt)
            'assignedLocationId'  => $user->location_id,
            'assignedLocationIds' => $user->role === 'security_lead'
                ? $user->managedLocations()->pluck('id')
                : collect(),
            'assignedDirectorId'  => $user->director_id,
            'assignedLeadIds'     => $user->supervisedLeads()->pluck('id'),
            'assignedNfcLocationIds' => $user->nfcLocations()->pluck('locations.id'),
        ]);
    }

    public function update(Request $request, TenantUser $user)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => ['required', 'email', 'max:255', Rule::unique(TenantUser::class)->ignore($user->id)],
            'password'       => 'nullable|string|min:8|confirmed',
            'role'           => ['required', Rule::in(self::ROLES)],
            'employed_since' => 'nullable|date',
            'left_at'        => 'nullable|date',
            'location_id'    => 'nullable|integer',
            'location_ids'   => 'nullable|array',
            'location_ids.*' => 'integer',
            'director_id'    => 'nullable|integer',
            'lead_ids'       => 'nullable|array',
            'lead_ids.*'     => 'integer',
            'nfc_location_ids'   => 'nullable|array',
            'nfc_location_ids.*' => 'integer',
        ]);

        $data = [
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'role'           => $validated['role'],
            'is_active'      => $request->boolean('is_active', false),
            'employed_since' => $validated['employed_since'] ?? null,
            'left_at'        => $validated['left_at'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);
        $this->syncAssignments($user, $request);

        return redirect()->route('admin.users.index')->with('success', 'Felhasználó sikeresen frissítve!');
    }

    public function updateExamOverrides(Request $request, TenantUser $user)
    {
        $request->validate([
            'overrides'                => 'nullable|array',
            'overrides.*.exam_id'      => 'required|integer',
            'overrides.*.max_attempts' => 'nullable|integer|min:1',
        ]);

        foreach ($request->input('overrides', []) as $item) {
            $examId      = $item['exam_id'];
            $maxAttempts = isset($item['max_attempts']) && $item['max_attempts'] !== '' && $item['max_attempts'] !== null
                ? (int) $item['max_attempts']
                : null;

            if ($maxAttempts === null) {
                UserExamOverride::where('user_id', $user->id)->where('exam_id', $examId)->delete();
            } else {
                UserExamOverride::updateOrCreate(
                    ['user_id' => $user->id, 'exam_id' => $examId],
                    ['max_attempts' => $maxAttempts]
                );
            }
        }

        return response()->json(['success' => true]);
    }

    public function destroy(TenantUser $user)
    {
        if ($user->id === Auth::guard('tenant')->id()) {
            return back()->with('error', 'Saját magát nem törölheti!');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Felhasználó törölve!');
    }
}
