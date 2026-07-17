using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Inventory;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages inventory stock movements and history.</summary>
public class InventoryController : BaseController
{
    private readonly IInventoryService _service;

    public InventoryController(IInventoryService service) => _service = service;

    /// <summary>Returns inventory movement history, optionally filtered by product.</summary>
    [HttpGet]
    [HttpGet("history")]
    [RequirePermission("Products", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryDto>>>> GetHistory([FromQuery] int? productId = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetHistoryAsync(productId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<InventoryDto>>.Ok(result));
    }

    /// <summary>Records a new inventory movement.</summary>
    [HttpPost]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<InventoryDto>>> CreateMovement([FromBody] CreateInventoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateMovementAsync(dto, CurrentUserId, cancellationToken);
        return Ok(ApiResponse<InventoryDto>.Ok(result, "Movement recorded."));
    }
}
