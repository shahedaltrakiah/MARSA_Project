<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@marsa.com'],
            [
                'name'     => 'MARSA Admin',
                'password' => Hash::make('Marsa@2026'),
                'role'     => 'super_admin',
            ]
        );
    }
}
