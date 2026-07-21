<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RegionResource;
use App\Models\Region;
use Illuminate\Http\JsonResponse;

class RegionController extends Controller
{
    public function index(): JsonResponse
    {
        $regions = Region::query()->orderBy('name_en')->get();

        return RegionResource::collection($regions)->response();
    }

    public function show(Region $region): JsonResponse
    {
        return (new RegionResource($region))->response();
    }
}
