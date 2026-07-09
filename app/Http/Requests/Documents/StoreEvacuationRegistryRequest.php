<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvacuationRegistryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'tenant_name' => ['required', 'string', 'max:255'],
            'remained_in_building' => ['nullable', 'string', 'max:2000'],
            'fire_safety_officer_name' => ['required', 'string', 'max:255'],
            'signature_tuzvedelmi_felelos' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ];
    }
}
