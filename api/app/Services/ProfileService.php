<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileService
{
    public function updateAvatar(User $user, UploadedFile $file): User
    {
        $oldPath = $user->avatar_url ? Str::after($user->avatar_url, Storage::disk('public')->url('')) : null;

        $path = $file->store('avatars', 'public');

        $user->update(['avatar_url' => Storage::disk('public')->url($path)]);

        if ($oldPath && Str::startsWith($oldPath, 'avatars/')) {
            Storage::disk('public')->delete($oldPath);
        }

        return $user;
    }
}
