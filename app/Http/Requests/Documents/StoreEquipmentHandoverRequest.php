<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreEquipmentHandoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'equipment_name' => ['required', 'string', 'max:255'],
            'issued_at' => ['required', 'date'],
            'issued_to_name' => ['required', 'string', 'max:255'],
            'issuer_security_service' => ['required', 'string', 'max:255'],
            'returned_at' => ['nullable', 'date'],
            'returned_by_name' => ['nullable', 'string', 'max:255'],
            'receiver_security_service' => ['nullable', 'string', 'max:255'],
        ];
    }
}
