<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSettings extends Model
{
    protected $fillable = ['logo_url', 'primary_color', 'secondary_color'];

    public static function current(): self
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'primary_color'   => '#002d62',
                'secondary_color' => '#00c4cc',
            ]
        );
    }
}
