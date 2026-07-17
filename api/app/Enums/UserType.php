<?php

declare(strict_types=1);

namespace App\Enums;

enum UserType: string
{
    case Customer = 'customer';
    case StoreOwner = 'store_owner';
    case StoreStaff = 'store_staff';
    case Admin = 'admin';
}
