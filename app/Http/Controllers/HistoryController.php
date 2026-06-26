<?php

namespace App\Http\Controllers;

use App\Models\Check;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Check::with('location')
            ->withCount(['checkItems', 'checkItems as checked_count' => fn($q) => $q->where('is_checked', true)])
            ->latest();

        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }
        if ($request->filled('search')) {
            $query->where('checked_by', 'like', '%' . $request->search . '%');
        }

        $checks    = $query->paginate(25)->withQueryString();
        $locations = Location::orderBy('name')->get();

        return Inertia::render('History/Index', ['checks' => $checks, 'locations' => $locations]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Check::with(['location', 'checkItems.item'])
            ->latest();

        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        $checks = $query->get();

        $filename = 'ellenorzesek_' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($checks) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel

            fputcsv($handle, ['ID', 'Helyszín', 'Ellenőrző személy', 'Dátum', 'Tételek', 'Megvolt', 'Megjegyzés'], ';');

            foreach ($checks as $check) {
                fputcsv($handle, [
                    $check->id,
                    $check->location->name ?? '-',
                    $check->checked_by,
                    $check->created_at->format('Y.m.d H:i'),
                    $check->check_items_count,
                    $check->checked_count,
                    $check->notes ?? '',
                ], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
