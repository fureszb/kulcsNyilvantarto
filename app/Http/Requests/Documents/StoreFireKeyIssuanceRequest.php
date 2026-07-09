<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreFireKeyIssuanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'seal_number' => ['required', 'string', 'max:100'],
            'seal_removed' => ['required', 'boolean'],
            'seal_applied' => ['required', 'boolean'],
            'issued_at' => ['required', 'date'],
            'issue_reason' => ['required', 'string', 'max:2000'],
            'closed_at' => ['nullable', 'date'],
            'signature_felvette' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
            'signature_leadta' => ['nullable', 'required_with:closed_at', 'string', 'regex:/^data:image\/png;base64,/'],
        ];
    }
}
