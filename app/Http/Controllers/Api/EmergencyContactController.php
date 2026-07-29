<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Api\EmergencyContactResource;
use App\Models\EmergencyContact;

class EmergencyContactController extends Controller
{
    public function index()
    {
        $contacts = EmergencyContact::orderBy('category')->orderBy('sort_order')->orderBy('name')->get();

        return EmergencyContactResource::collection($contacts);
    }
}
