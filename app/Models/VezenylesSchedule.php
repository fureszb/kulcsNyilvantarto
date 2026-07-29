<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class VezenylesSchedule extends Model
{
    protected $connection = 'tenant';
    protected $table = 'vezenyles_schedule';
    public $timestamps = false;

    protected $fillable = ['employee_id', 'year', 'month', 'day', 'value'];

    /**
     * Adott napra ténylegesen beosztott (konkrét óraszámmal rendelkező, fiókhoz kötött)
     * dolgozók user_id → érték (óraszám) párjai — a "ki van bent" jelvények/lista valós
     * adatforrása az NFC self-report (`is_present`) helyett, mert az utóbbi megbízhatatlan
     * (elfelejtett be/kilépés-koppintás, és a checkpoint-modellben amúgy sem jelent
     * beléptetést). "X" (szabadnap), "?" (bizonytalan), "+" (elérhető, de nincs beosztva) és
     * üres cella mind NEM számít beosztottnak — csak a konkrét óraszám. Több egyidejű
     * beosztás esetén (elvileg nem fordulhat elő, egy user egy employee-sorhoz köthető) az
     * utolsó nyer.
     */
    public static function scheduledEntriesForDate(Carbon $date): Collection
    {
        return static::where('year', $date->year)
            ->where('month', $date->month)
            ->where('day', $date->day)
            ->whereNotIn('value', ['X', '?', '+'])
            ->whereNotNull('value')
            ->join('vezenyles_employees', 'vezenyles_employees.id', '=', 'vezenyles_schedule.employee_id')
            ->whereNotNull('vezenyles_employees.user_id')
            ->select('vezenyles_employees.user_id as user_id', 'vezenyles_schedule.value as value')
            ->get()
            ->keyBy('user_id');
    }

    public static function scheduledUserIdsForDate(Carbon $date): Collection
    {
        return static::scheduledEntriesForDate($date)->keys()->values();
    }

    /** Egy adott user saját beosztás-cellája adott napra (nyers érték, X/?/+/óraszám is lehet —
     *  a hívó fél dönti el, mit kezd vele). `null`, ha nincs a userhez kötött `VezenylesEmployee`
     *  sor, vagy nincs mára bejegyzés. Ugyanaz a lekérdezés, mint amit a "Mai beosztásod"
     *  kártya (`HomeController::todaySchedule`) és a "Jelenlegi állapotod"/"Mai bejárás"
     *  on-duty jelzés (`HomeController::presence`) is használ, hogy konzisztens maradjon. */
    public static function todayValueForUser(int $userId, ?Carbon $date = null): ?string
    {
        $employee = VezenylesEmployee::where('user_id', $userId)->first();
        if (!$employee) {
            return null;
        }

        $date = $date ?? Carbon::now();

        return static::where('employee_id', $employee->id)
            ->where('year', $date->year)
            ->where('month', $date->month)
            ->where('day', $date->day)
            ->value('value');
    }
}
