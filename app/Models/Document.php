<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Document extends Model
{
    protected $connection = 'tenant';

    protected $fillable = [
        'document_type', 'location_id', 'created_by_user_id', 'status', 'pdf_path', 'finalized_at',
    ];

    protected $casts = [
        'finalized_at' => 'datetime',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'created_by_user_id');
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(DocumentSignature::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(DocumentAttachment::class);
    }

    public function incidentReport(): HasOne
    {
        return $this->hasOne(DocumentIncidentReport::class);
    }

    public function vehicleEntry(): HasOne
    {
        return $this->hasOne(DocumentVehicleEntry::class);
    }

    public function equipmentHandover(): HasOne
    {
        return $this->hasOne(DocumentEquipmentHandover::class);
    }

    public function damageReport(): HasOne
    {
        return $this->hasOne(DocumentDamageReport::class);
    }

    public function evacuationReport(): HasOne
    {
        return $this->hasOne(DocumentEvacuationReport::class);
    }

    public function evacuationRegistry(): HasOne
    {
        return $this->hasOne(DocumentEvacuationRegistry::class);
    }

    public function keyCardHandover(): HasOne
    {
        return $this->hasOne(DocumentKeyCardHandover::class);
    }

    public function lostFoundReport(): HasOne
    {
        return $this->hasOne(DocumentLostFoundReport::class);
    }

    public function bombThreat(): HasOne
    {
        return $this->hasOne(DocumentBombThreat::class);
    }

    public function fireKeyIssuance(): HasOne
    {
        return $this->hasOne(DocumentFireKeyIssuance::class);
    }

    /** A document_type-nak megfelelő detail-reláció betöltött modellje. */
    public function detail(): ?Model
    {
        return match ($this->document_type) {
            'feljegyzeses_jegyzokonyv' => $this->incidentReport,
            'gepjarmu_beleptetes' => $this->vehicleEntry,
            'eszkoz_atadas_atvetel' => $this->equipmentHandover,
            'karfelveteli_jegyzokonyv' => $this->damageReport,
            'kiuritesi_jegyzokonyv' => $this->evacuationReport,
            'kiuritesi_nyilvantartas' => $this->evacuationRegistry,
            'kulcs_kartya_atadas_atvetel' => $this->keyCardHandover,
            'talalt_targy_jegyzokonyv' => $this->lostFoundReport,
            'robbantasi_fenyegetes' => $this->bombThreat,
            'tuzkulcs_tuzkazetta_kiadas' => $this->fireKeyIssuance,
            default => null,
        };
    }

    public function typeLabel(): string
    {
        return match ($this->document_type) {
            'feljegyzeses_jegyzokonyv' => 'Feljegyzéses jegyzőkönyv',
            'gepjarmu_beleptetes' => 'Gépjármű beléptető nyilvántartás',
            'eszkoz_atadas_atvetel' => 'Eszközök átadás-átvétele',
            'karfelveteli_jegyzokonyv' => 'Kárfelvételi jegyzőkönyv',
            'kiuritesi_jegyzokonyv' => 'Kiürítési jegyzőkönyv',
            'kiuritesi_nyilvantartas' => 'Kiürítési nyilvántartás',
            'kulcs_kartya_atadas_atvetel' => 'Kulcs/Kártya átadás-átvétele',
            'talalt_targy_jegyzokonyv' => 'Talált tárgy jegyzőkönyv',
            'robbantasi_fenyegetes' => 'Robbantással fenyegetés',
            'tuzkulcs_tuzkazetta_kiadas' => 'Tűzkulcs és tűzkazetta kiadás',
            default => $this->document_type,
        };
    }

    public function typeColor(): string
    {
        return match ($this->document_type) {
            'feljegyzeses_jegyzokonyv' => 'slate',
            'gepjarmu_beleptetes' => 'sky',
            'eszkoz_atadas_atvetel' => 'amber',
            'karfelveteli_jegyzokonyv' => 'rose',
            'kiuritesi_jegyzokonyv' => 'orange',
            'kiuritesi_nyilvantartas' => 'orange',
            'kulcs_kartya_atadas_atvetel' => 'blue',
            'talalt_targy_jegyzokonyv' => 'teal',
            'robbantasi_fenyegetes' => 'red',
            'tuzkulcs_tuzkazetta_kiadas' => 'orange',
            default => 'slate',
        };
    }
}
