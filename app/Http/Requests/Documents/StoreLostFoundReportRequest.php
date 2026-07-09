<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreLostFoundReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'subject' => ['required', 'string', 'max:255'],
            'recorded_at' => ['required', 'date'],
            'location_text' => ['required', 'string', 'max:255'],
            'representative_user_id' => ['nullable', 'integer', 'exists:tenant.users,id'],
            'witness_user_id' => ['nullable', 'integer', 'exists:tenant.users,id'],
            'guard_user_id' => ['nullable', 'integer', 'exists:tenant.users,id'],
            'content_description' => ['required', 'string', 'max:2000'],
            'handed_over_at' => ['nullable', 'date'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'recipient_id_card_number' => ['required', 'string', 'max:100'],
            'recipient_address' => ['required', 'string', 'max:255'],
            'signature_atvevo' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ];
    }
}
