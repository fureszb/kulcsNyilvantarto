<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdmin extends Command
{
    protected $signature = 'superadmin:create {email} {name} {--password=}';
    protected $description = 'Új SuperAdmin felhasználó létrehozása a fő adatbázisban';

    public function handle(): int
    {
        $email    = $this->argument('email');
        $name     = $this->argument('name');
        $password = $this->option('password') ?: $this->secret('Jelszó (min. 8 karakter)');

        if (strlen($password) < 8) {
            $this->error('A jelszónak legalább 8 karakter hosszúnak kell lennie.');
            return 1;
        }

        if (User::where('email', $email)->exists()) {
            $this->error("A '{$email}' email cím már foglalt.");
            return 1;
        }

        User::create([
            'name'     => $name,
            'email'    => $email,
            'password' => Hash::make($password),
        ]);

        $this->info("SuperAdmin létrehozva: {$name} <{$email}>");

        return 0;
    }
}
