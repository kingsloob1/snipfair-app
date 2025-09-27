<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class UrlOrFile implements ValidationRule
{
    public $urlAndFileRules = [
        'url' => 'required|url',
        'file' => 'required|file'
    ];

    public $urlAndFileMessages = [
        'url' => [],
        'file' => []
    ];

    public function __construct(array $urlAndFileRules, array $urlAndFileMessages)
    {
        $this->urlAndFileRules = $urlAndFileRules;
        $this->urlAndFileMessages = $urlAndFileMessages;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $uniqueAttributeName = uniqid();
        if (is_string($value)) {
            // Check if it's a valid URL
            $urlValidator = Validator::make([$uniqueAttributeName => $value], [$uniqueAttributeName => $this->urlAndFileRules['url']], $this->buildMessageArr($uniqueAttributeName, $this->urlAndFileMessages['url'] ?? []));

            if ($urlValidator->fails()) {
                $errors = $urlValidator->errors();
                $fail($errors->first());
                return;
            }

            return;
        }

        if ($value instanceof UploadedFile && $value->isValid()) {
            // Check if it's a valid URL
            $fileValidator = Validator::make([$uniqueAttributeName => $value], [$uniqueAttributeName => $this->urlAndFileRules['file']], $this->buildMessageArr($uniqueAttributeName, $this->urlAndFileMessages['file'] ?? []));

            if ($fileValidator->fails()) {
                $errors = $fileValidator->errors();
                $fail($errors->first());
                return;
            }

            return;
        }


        $fail('The :attribute must be a valid URL or a valid file.');
    }

    private function buildMessageArr(string $uniqueAttributeName, array $messages): array
    {
        return array_map(function ($message) use ($uniqueAttributeName): string {
            return $uniqueAttributeName . '.' . $message;
        }, $messages);
    }
}
