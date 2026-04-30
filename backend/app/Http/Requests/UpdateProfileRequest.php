<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'idea' => ['nullable', 'string'],
            'problem' => ['nullable', 'string'],
            'solution' => ['nullable', 'string'],
            'customer' => ['nullable', 'string'],
            'stage' => ['nullable', Rule::in(['idea', 'validation', 'mvp', 'early_traction', 'scaling'])],
            'team' => ['nullable', 'string'],
            'traction' => ['nullable', 'string'],
            'challenges' => ['nullable', 'string'],
            'goals' => ['nullable', 'string'],
        ];
    }
}
