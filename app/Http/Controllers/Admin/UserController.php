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
            'assignableLocations' => Location::orderBy('name')->get(['id', 'name']),
            'assignableLeads'     => $this->securityLeads(),
        ]);
    }

    /** A hozzárendeléshez választható biztonsági vezetők (area_director-hoz). */
    private function securityLeads()
    {
        return TenantUser::where('role', 'security_lead')->orderBy('name')->get(['id', 'name']);
    }

    /** A role-váltáshoz igazított hozzárendelés-szinkron. */
    private function syncAssignments(TenantUser $user, Request $request): void
    {
        $locationIds = collect($request->input('location_ids', []))->map(fn ($id) => (int) $id)->all();
        $leadIds     = collect($request->input('lead_ids', []))->map(fn ($id) => (int) $id)->all();

        // Minden pivotot a role szerint állítunk be; a nem illő kapcsolatokat ürítjük
        $user->workLocations()->sync($user->role === 'user' ? $locationIds : []);
        $user->managedLocations()->sync($user->role === 'security_lead' ? $locationIds : []);
        $user->supervisedLeads()->sync($user->role === 'area_director' ? $leadIds : []);
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
            'location_ids'   => 'nullable|array',
            'location_ids.*' => 'integer',
            'lead_ids'       => 'nullable|array',
            'lead_ids.*'     => 'integer',
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
            // A user aktuális hozzárendelései (role-tól függően használt)
            'assignedLocationIds' => $user->role === 'security_lead'
                ? $user->managedLocations()->pluck('locations.id')
                : $user->workLocations()->pluck('locations.id'),
            'assignedLeadIds'     => $user->supervisedLeads()->pluck('users.id'),
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
            'location_ids'   => 'nullable|array',
            'location_ids.*' => 'integer',
            'lead_ids'       => 'nullable|array',
            'lead_ids.*'     => 'integer',
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
