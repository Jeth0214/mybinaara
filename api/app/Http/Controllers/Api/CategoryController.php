<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categories) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'search' => ['sometimes', 'string', 'max:100'],
        ]);

        $categories = $this->categories->list($filters);

        return CategoryResource::collection($categories)->response();
    }

    public function show(Category $category): JsonResponse
    {
        return (new CategoryResource($category))->response();
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categories->create($request->validated(), $request->file('image'));

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category = $this->categories->update($category, $request->validated(), $request->file('image'));

        return (new CategoryResource($category))->response();
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        $this->categories->delete($category);

        return response()->json(null, 204);
    }

    public function toggleStatus(Category $category): JsonResponse
    {
        $this->authorize('update', $category);

        $category = $this->categories->toggleStatus($category);

        return (new CategoryResource($category))->response();
    }
}
