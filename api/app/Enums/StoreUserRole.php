<?php

declare(strict_types=1);

namespace App\Enums;

enum StoreUserRole: string
{
    case Owner = 'owner';
    case Staff = 'staff';
}
