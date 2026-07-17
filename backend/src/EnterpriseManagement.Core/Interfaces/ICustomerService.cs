using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Customers;

namespace EnterpriseManagement.Core.Interfaces;

/// <summary>Customer service contract.</summary>
public interface ICustomerService
{
    Task<PagedResult<CustomerDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<CustomerDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken cancellationToken = default);
    Task<CustomerDto?> UpdateAsync(int id, UpdateCustomerDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
