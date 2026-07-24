<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DistrictResource;
use App\Models\District;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DistrictController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $districts = District::query()
            ->when($request->integer('city_id'), fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->orderBy('name_en')
            ->get();

        return DistrictResource::collection($districts)->response();
    }

    public function show(District $district): JsonResponse
    {
        return (new DistrictResource($district))->response();
    }
}
