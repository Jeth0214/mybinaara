<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecentStoreResource;
use App\Http\Resources\StoreActivityResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboard) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->hasPermission('dashboard.view'), 403);

        $dashboard = $this->dashboard->getDashboard();

        return response()->json(['data' => [
            'stats' => $dashboard['stats'],
            'charts' => $dashboard['charts'],
            'recentStores' => RecentStoreResource::collection($dashboard['recentStores']),
            'storeActivity' => StoreActivityResource::collection($dashboard['storeActivity']),
        ]]);
    }
}
