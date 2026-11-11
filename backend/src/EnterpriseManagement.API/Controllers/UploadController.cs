using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Handles file uploads.</summary>
[Authorize]
public class UploadController : BaseController
{
    private const long MaxFileBytes = 5 * 1024 * 1024;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".png", ".jpg", ".jpeg"
    };

    private readonly IWebHostEnvironment _environment;

    public UploadController(IWebHostEnvironment environment) => _environment = environment;

    /// <summary>Uploads one or more files and returns their stored paths.</summary>
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFileCollection files, CancellationToken cancellationToken)
    {
        if (files is null || files.Count == 0)
            return BadRequest(new { success = false, message = "No files provided." });

        // Reject the entire request before persisting any file.
        foreach (var file in files)
        {
            var extension = Path.GetExtension(file.FileName);
            if (file.Length == 0 || file.Length > MaxFileBytes || !AllowedExtensions.Contains(extension))
                return BadRequest(new { success = false, message = "Invalid file size or extension." });
        }

        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadsPath);

        var paths = new List<string>();
        foreach (var file in files)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(uploadsPath, fileName);
            await using var stream = System.IO.File.Create(fullPath);
            await file.CopyToAsync(stream, cancellationToken);
            paths.Add(fileName);
        }

        return Ok(new { success = true, message = "Files uploaded.", data = paths });
    }
}
