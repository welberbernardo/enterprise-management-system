using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Settings;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages company settings.</summary>
public class SettingsController : BaseController
{
    private readonly ISettingService _service;

    public SettingsController(ISettingService service) => _service = service;

    /// <summary>Returns all company settings.</summary>
    [HttpGet]
    [RequirePermission("Settings", "Manage")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CompanySettingDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<CompanySettingDto>>.Ok(result));
    }

    /// <summary>Returns a single setting by key.</summary>
    [HttpGet("{key}")]
    [RequirePermission("Settings", "Manage")]
    public async Task<ActionResult<ApiResponse<CompanySettingDto>>> GetByKey(string key, CancellationToken cancellationToken)
    {
        var result = await _service.GetByKeyAsync(key, cancellationToken);
        return result is null ? NotFound(ApiResponse<CompanySettingDto>.Fail("Setting not found.")) : Ok(ApiResponse<CompanySettingDto>.Ok(result));
    }

    /// <summary>Creates or updates a setting.</summary>
    [HttpPut("{key}")]
    [RequirePermission("Settings", "Manage")]
    public async Task<ActionResult<ApiResponse<CompanySettingDto>>> Upsert(string key, [FromBody] UpdateSettingDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpsertAsync(key, dto, cancellationToken);
        return Ok(ApiResponse<CompanySettingDto>.Ok(result, "Setting saved."));
    }
}
