<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CityResource;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cities = City::query()
            ->when($request->integer('region_id'), fn ($query, $regionId) => $query->where('region_id', $regionId))
            ->orderBy('name_en')
            ->get();

        return CityResource::collection($cities)->response();
    }

    public function show(City $city): JsonResponse
    {
        return (new CityResource($city))->response();
    }
}
