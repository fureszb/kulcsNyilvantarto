<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBombThreatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'call_transcript' => ['required', 'string', 'max:5000'],
            'caller_gender' => ['required', Rule::in(['ferfi', 'no'])],
            'caller_age_group' => ['required', Rule::in(['fiatal', 'kozepkoru', 'idos', 'gyermek_lany', 'gyermek_fiu'])],
            'speech_style' => ['required', Rule::in([
                'normalis', 'idegen_akcentus', 'tajszolas', 'hadaro', 'magabiztos', 'gyors',
                'lassu', 'tagolt', 'vontatott', 'posze', 'felolvasott', 'irodalmi',
            ])],
            'voice_tone' => ['required', Rule::in([
                'magas', 'mely', 'lagy', 'suttogo', 'halk', 'torzitott', 'rekedt', 'orrhang', 'hangos',
            ])],
            'emotional_state' => ['required', Rule::in([
                'raero', 'izgatott', 'pattogo', 'kiabalo', 'nyugodt', 'erzelmes',
                'dadogo', 'vidam', 'tragar', 'ittas', 'selypito', 'osszefuggestelen',
            ])],
            'background_noise' => ['required', Rule::in([
                'semmi', 'vasutallomas', 'tarsasag', 'utcai_forgalom', 'csorompoles',
                'zene', 'gyar_uzem', 'tv', 'szorakozohely', 'hivatali_zaj',
            ])],
            'area_familiarity' => ['required', Rule::in(['altalanos', 'szakszeru', 'helyi_ismeretre_vallo'])],
            'other_remarks' => ['nullable', 'string', 'max:2000'],
            'call_datetime' => ['required', 'date'],
            'caller_phone_number' => ['nullable', 'string', 'max:50'],
            'receiver_name' => ['required', 'string', 'max:255'],
            'receiver_position' => ['required', 'string', 'max:255'],
            'receiver_birth_date' => ['required', 'date'],
            'receiver_mother_name' => ['required', 'string', 'max:255'],
            'receiver_address' => ['required', 'string', 'max:255'],
            'receiver_id_card_number' => ['required', 'string', 'max:100'],
            'signature_hivast_fogado' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ];
    }
}
