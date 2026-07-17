namespace EnterpriseManagement.Core.DTOs.Common;

/// <summary>Standard paged result wrapper.</summary>
public class PagedResult<T>
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrevious => Page > 1;
    public IReadOnlyList<T> Items { get; set; } = new List<T>();
}

/// <summary>Query parameters for paged, searchable endpoints.</summary>
public class PagedQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>Generic API response envelope.</summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public IReadOnlyList<string> Errors { get; set; } = new List<string>();

    public static ApiResponse<T> Ok(T data, string? message = null) => new() { Success = true, Data = data, Message = message };
    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null) => new() { Success = false, Message = message, Errors = errors?.ToList() ?? new List<string>() };
}
