using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Categories;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages product categories.</summary>
public class CategoriesController : BaseController
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service) => _service = service;

    [HttpGet]
    [RequirePermission("Products", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<CategoryDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Products", "View")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<CategoryDto>.Fail("Category not found.")) : Ok(ApiResponse<CategoryDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create([FromBody] CreateCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<CategoryDto>.Ok(result, "Category created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(int id, [FromBody] UpdateCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<CategoryDto>.Fail("Category not found.")) : Ok(ApiResponse<CategoryDto>.Ok(result, "Category updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Category deleted.")) : NotFound(ApiResponse<bool>.Fail("Category not found."));
    }
}
