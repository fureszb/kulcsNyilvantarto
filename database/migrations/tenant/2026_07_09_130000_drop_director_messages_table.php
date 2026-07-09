<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection('tenant')->dropIfExists('director_messages');
    }

    public function down(): void
    {
        // A "névtelen visszajelzés" funkció véglegesen megszűnt, nincs visszaállítás.
    }
};
