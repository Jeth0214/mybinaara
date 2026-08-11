<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Admin-web and store-web are separate SPAs that authenticate via Sanctum
    | personal-access tokens sent as an Authorization: Bearer header, not via
    | Sanctum's stateful cookie flow — so supports_credentials stays false and
    | no cookie domain configuration is needed here.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('ADMIN_WEB_URL', 'http://localhost:4200'),
        env('STORE_WEB_URL', 'http://localhost:4201'),
        'http://localhost:4200',
        'http://localhost:4201',
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
