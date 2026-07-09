<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'license_plate' => ['required', 'string', 'max:20'],
            'company_or_name' => ['required', 'string', 'max:255'],
            'entry_date' => ['required', 'date'],
            'entry_time' => ['required', 'date_format:H:i'],
            'exit_time' => ['nullable', 'date_format:H:i'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
