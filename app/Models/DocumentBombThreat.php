<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentBombThreat extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_id', 'call_transcript', 'caller_gender', 'caller_age_group', 'speech_style',
        'voice_tone', 'emotional_state', 'background_noise', 'area_familiarity', 'other_remarks',
        'call_datetime', 'caller_phone_number', 'receiver_name', 'receiver_position',
        'receiver_birth_date', 'receiver_mother_name', 'receiver_address', 'receiver_id_card_number',
    ];

    protected $casts = [
        'call_datetime' => 'datetime',
        'receiver_birth_date' => 'date',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function callerGenderLabel(): string
    {
        return match ($this->caller_gender) {
            'ferfi' => 'Férfi',
            'no' => 'Nő',
            default => $this->caller_gender,
        };
    }

    public function callerAgeGroupLabel(): string
    {
        return match ($this->caller_age_group) {
            'fiatal' => 'Fiatal',
            'kozepkoru' => 'Középkorú',
            'idos' => 'Idős',
            'gyermek_lany' => 'Gyermek lány',
            'gyermek_fiu' => 'Gyermek fiú',
            default => $this->caller_age_group,
        };
    }

    public function speechStyleLabel(): string
    {
        return match ($this->speech_style) {
            'normalis' => 'Normális',
            'idegen_akcentus' => 'Idegen akcentus',
            'tajszolas' => 'Tájszólás',
            'hadaro' => 'Hadaró',
            'magabiztos' => 'Magabiztos',
            'gyors' => 'Gyors',
            'lassu' => 'Lassú',
            'tagolt' => 'Tagolt',
            'vontatott' => 'Vontatott',
            'posze' => 'Pösze',
            'felolvasott' => 'Felolvasott',
            'irodalmi' => 'Irodalmi',
            default => $this->speech_style,
        };
    }

    public function voiceToneLabel(): string
    {
        return match ($this->voice_tone) {
            'magas' => 'Magas',
            'mely' => 'Mély',
            'lagy' => 'Lágy',
            'suttogo' => 'Suttogó',
            'halk' => 'Halk',
            'torzitott' => 'Torzított',
            'rekedt' => 'Rekedt',
            'orrhang' => 'Orrhang',
            'hangos' => 'Hangos',
            default => $this->voice_tone,
        };
    }

    public function emotionalStateLabel(): string
    {
        return match ($this->emotional_state) {
            'raero' => 'Ráérős',
            'izgatott' => 'Izgatott',
            'pattogo' => 'Pattogó',
            'kiabalo' => 'Kiabáló',
            'nyugodt' => 'Nyugodt',
            'erzelmes' => 'Érzelmes',
            'dadogo' => 'Dadogó',
            'vidam' => 'Vidám',
            'tragar' => 'Trágár',
            'ittas' => 'Ittas',
            'selypito' => 'Selypítő',
            'osszefuggestelen' => 'Összefüggéstelen',
            default => $this->emotional_state,
        };
    }

    public function backgroundNoiseLabel(): string
    {
        return match ($this->background_noise) {
            'semmi' => 'Semmi',
            'vasutallomas' => 'Vasútállomás',
            'tarsasag' => 'Társaság',
            'utcai_forgalom' => 'Utcai forgalom',
            'csorompoles' => 'Csörömpölés',
            'zene' => 'Zene',
            'gyar_uzem' => 'Gyár-üzem',
            'tv' => 'TV',
            'szorakozohely' => 'Szórakozóhely',
            'hivatali_zaj' => 'Hivatali zaj',
            default => $this->background_noise,
        };
    }

    public function areaFamiliarityLabel(): string
    {
        return match ($this->area_familiarity) {
            'altalanos' => 'Általános',
            'szakszeru' => 'Szakszerű',
            'helyi_ismeretre_vallo' => 'Helyi ismeretre valló',
            default => $this->area_familiarity,
        };
    }
}
