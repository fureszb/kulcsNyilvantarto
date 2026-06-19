<?php

namespace Database\Seeders;

use App\Models\Training;
use App\Models\TrainingStep;
use App\Models\TrainingAnswer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LiwoTrainingSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('tenants/liwo.sqlite');
        config(['database.connections.tenant.database' => $path]);
        DB::purge('tenant');
        $prev = DB::getDefaultConnection();
        DB::setDefaultConnection('tenant');

        $this->sprinkler();
        $this->tuzvedelem();
        $this->belepokartya();

        DB::setDefaultConnection($prev);
        DB::purge('tenant');

        $this->command->info('Liwo oktatások feltöltve.');
    }

    private function sprinkler(): void
    {
        $t = Training::create([
            'title'       => 'Sprinkler rendszer kezelése',
            'description' => 'A raktárban elhelyezett sprinkler rendszer helyes kezelése, leállítása és visszaindítása vészhelyzet esetén.',
            'is_active'   => true,
            'sort_order'  => 1,
        ]);

        $this->step($t, 1,
            'A sprinkler rendszer élesítéséhez melyik irányba kell elfordítani a főcsapot?',
            [
                ['Jobbra (az óramutató járásával megegyező irányba)', false],
                ['Balra (az óramutató járásával ellentétes irányba)', true],
                ['A csapot nem kell elfordítani, magától nyílik',    false],
            ]
        );

        $this->step($t, 2,
            'Tűzjelzés esetén mikor szabad a sprinkler rendszert leállítani?',
            [
                ['Azonnal, amint a jelzőcsengő megszólal',                    false],
                ['Csak a tűzoltóság megérkezése és utasítása után',           true],
                ['Soha, a rendszer automatikusan leáll',                       false],
            ]
        );

        $this->step($t, 3,
            'Hol található a sprinkler rendszer vezérlőszekrénye a raktárban?',
            [
                ['A raktár közepén, a polcok között',                          false],
                ['A főbejárattól jobbra, a tűzbiztonsági táblánál',           true],
                ['A tetőn, csak szakember érheti el',                          false],
            ]
        );

        $this->step($t, 4,
            'Mennyi időn belül kell értesíteni a karbantartó céget, ha egy sprinkler fej megsérült?',
            [
                ['72 órán belül',                             false],
                ['A következő éves karbantartáskor',          false],
                ['Azonnal, a sérülés észlelése után',         true],
            ]
        );
    }

    private function tuzvedelem(): void
    {
        $t = Training::create([
            'title'       => 'Tűzvédelmi alapismeretek',
            'description' => 'Alapvető tűzvédelmi szabályok, menekülési útvonalak és a tűzoltó készülékek helyes használata.',
            'is_active'   => true,
            'sort_order'  => 2,
        ]);

        $this->step($t, 1,
            'Melyik tűzoltó készüléket TILOS elektromos tűznél használni?',
            [
                ['CO2 (szén-dioxid) készüléket', false],
                ['Vizes (vízsugár) készüléket',  true],
                ['Porral oltó készüléket',        false],
            ]
        );

        $this->step($t, 2,
            'Tűz esetén melyik az elsődleges teendő?',
            [
                ['Azonnal megpróbálni eloltani a tüzet',                                    false],
                ['Vészriasztás, kollégák értesítése, kiürítés, majd 112 hívás',             true],
                ['Megvárni amíg biztosra látszik hogy tűz van',                             false],
            ]
        );

        $this->step($t, 3,
            'Melyik irányba kell tartani a tűzoltó készülék szórócsövét oltás közben?',
            [
                ['A lángok tetejére',                                        false],
                ['A füst felé, felülről lefelé',                             false],
                ['A tűz tövére, pásztázó mozdulattal',                       true],
            ]
        );
    }

    private function belepokartya(): void
    {
        $t = Training::create([
            'title'       => 'Belépőkártya és kulcskezelési szabályok',
            'description' => 'A vállalati belépőkártyák és kulcsok helyes kezelése, elvesztés esetén teendők.',
            'is_active'   => true,
            'sort_order'  => 3,
        ]);

        $this->step($t, 1,
            'Mit kell tenni, ha elveszett a belépőkártyád?',
            [
                ['Megvárni, hátha előkerül, majd jelezni ha 1 héten belül sem kerül elő', false],
                ['Azonnal jelezni a biztonsági koordinátornak, aki tiltólistára teszi',    true],
                ['Felhasználni amíg lehet, majd új kártyát kérni',                         false],
            ]
        );

        $this->step($t, 2,
            'Megengedett-e a belépőkártyád kölcsönadása egy kollégának?',
            [
                ['Igen, ha ismert kollégáról van szó',                                   false],
                ['Igen, de csak munkaidőben',                                             false],
                ['Nem, a kártya személyre szóló, nem adható át senkinek',                true],
            ]
        );

        $this->step($t, 3,
            'Munkanap végén hová kell visszahelyezni a kiadott kulcsokat?',
            [
                ['Az asztalfiókba, másnap reggelig',                                     false],
                ['A portán kijelölt kulcstartóba, a nyilvántartásba bejegyezve',         true],
                ['Nem kell visszavinni, másnap is szükség lehet rá',                     false],
            ]
        );
    }

    private function step(Training $training, int $order, string $question, array $answers): void
    {
        $step = TrainingStep::create([
            'training_id' => $training->id,
            'question'    => $question,
            'sort_order'  => $order,
        ]);

        foreach ($answers as $idx => [$text, $correct]) {
            TrainingAnswer::create([
                'step_id'    => $step->id,
                'text'       => $text,
                'is_correct' => $correct,
                'sort_order' => $idx,
            ]);
        }
    }
}
