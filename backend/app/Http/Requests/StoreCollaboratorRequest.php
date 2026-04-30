<?php
namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCollaboratorRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        return $project instanceof Project && $this->user()->can('delete', $project);
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                Rule::exists('users', 'email'),
            ],
            'role' => ['required', Rule::in(['editor', 'viewer'])],
        ];
    }

    public function messages(): array
    {
        return [
            'email.exists' => 'No registered user found with this email address.',
        ];
    }
}
