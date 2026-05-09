<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $logoRules = ['sometimes', 'nullable', 'string', 'max:500'];
        if ($this->hasFile('logo')) {
            $logoRules = ['nullable', 'image', 'max:2048'];
        }

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo' => $logoRules,
        ];
    }
}
