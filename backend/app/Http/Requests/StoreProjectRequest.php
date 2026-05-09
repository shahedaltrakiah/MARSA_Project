<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $logoRules = ['nullable', 'string', 'max:500'];
        if ($this->hasFile('logo')) {
            $logoRules = ['nullable', 'image', 'max:2048'];
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo' => $logoRules,
        ];
    }
}
