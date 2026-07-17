using EnterpriseManagement.Core.DTOs.Accounts;
using EnterpriseManagement.Core.DTOs.Audit;
using EnterpriseManagement.Core.DTOs.Categories;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.DTOs.Inventory;
using EnterpriseManagement.Core.DTOs.Invoices;
using EnterpriseManagement.Core.DTOs.Orders;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.DTOs.Products;
using EnterpriseManagement.Core.DTOs.Reports;
using EnterpriseManagement.Core.DTOs.Roles;
using EnterpriseManagement.Core.DTOs.Settings;
using EnterpriseManagement.Core.DTOs.Suppliers;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Entities;

namespace EnterpriseManagement.Core.Interfaces;

/// <summary>User management service contract.</summary>
public interface IUserService
{
    Task<PagedResult<UserDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> AssignRoleAsync(int userId, AssignRoleDto dto, CancellationToken cancellationToken = default);
    Task<IEnumerable<PermissionDto>> GetPermissionsAsync(int userId, CancellationToken cancellationToken = default);
}

/// <summary>Role management service contract.</summary>
public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<RoleDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<RoleDto> CreateAsync(CreateRoleDto dto, CancellationToken cancellationToken = default);
    Task<RoleDto?> UpdateAsync(int id, UpdateRoleDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> AssignPermissionsAsync(int roleId, AssignPermissionsDto dto, CancellationToken cancellationToken = default);
    Task<IEnumerable<PermissionDto>> GetPermissionsAsync(int roleId, CancellationToken cancellationToken = default);
}

/// <summary>Permission management service contract.</summary>
public interface IPermissionService
{
    Task<PagedResult<PermissionDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<PermissionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PermissionDto> CreateAsync(CreatePermissionDto dto, CancellationToken cancellationToken = default);
    Task<PermissionDto?> UpdateAsync(int id, UpdatePermissionDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

/// <summary>Customer contact service contract.</summary>
public interface ICustomerContactService
{
    Task<IEnumerable<CustomerContactDto>> GetByCustomerAsync(int customerId, CancellationToken cancellationToken = default);
    Task<CustomerContactDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CustomerContactDto> CreateAsync(CreateCustomerContactDto dto, CancellationToken cancellationToken = default);
    Task<CustomerContactDto?> UpdateAsync(int id, UpdateCustomerContactDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

/// <summary>Supplier service contract.</summary>
public interface ISupplierService
{
    Task<PagedResult<SupplierDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<SupplierDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default);
    Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

/// <summary>Category service contract.</summary>
public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

/// <summary>Product service contract.</summary>
public interface IProductService
{
    Task<PagedResult<ProductDto>> GetPagedAsync(int page, int pageSize, string? search = null, int? categoryId = null, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> AdjustStockAsync(StockAdjustmentDto dto, int? userId = null, CancellationToken cancellationToken = default);
}

/// <summary>Order service contract.</summary>
public interface IOrderService
{
    Task<PagedResult<OrderDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<OrderDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> CreateAsync(CreateOrderDto dto, CancellationToken cancellationToken = default);
    Task<OrderDto?> UpdateAsync(int id, UpdateOrderDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ChangeStatusAsync(int id, ChangeOrderStatusDto dto, CancellationToken cancellationToken = default);
}

/// <summary>Invoice service contract.</summary>
public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<InvoiceDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto, CancellationToken cancellationToken = default);
    Task<InvoiceDto?> UpdateAsync(int id, UpdateInvoiceDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ChangeStatusAsync(int id, ChangeInvoiceStatusDto dto, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfAsync(int id, CancellationToken cancellationToken = default);
}

/// <summary>Inventory service contract.</summary>
public interface IInventoryService
{
    Task<IEnumerable<InventoryDto>> GetHistoryAsync(int? productId = null, CancellationToken cancellationToken = default);
    Task<InventoryDto> CreateMovementAsync(CreateInventoryDto dto, int? userId = null, CancellationToken cancellationToken = default);
}

/// <summary>Account payable service contract.</summary>
public interface IAccountPayableService
{
    Task<IEnumerable<AccountPayableDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<AccountPayableDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AccountPayableDto> CreateAsync(CreateAccountPayableDto dto, CancellationToken cancellationToken = default);
    Task<bool> RecordPaymentAsync(int id, PayablePaymentDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

/// <summary>Account receivable service contract.</summary>
public interface IAccountReceivableService
{
    Task<IEnumerable<AccountReceivableDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<AccountReceivableDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AccountReceivableDto> CreateAsync(CreateAccountReceivableDto dto, CancellationToken cancellationToken = default);
    Task<bool> RecordPaymentAsync(int id, ReceivablePaymentDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

/// <summary>Dashboard service contract.</summary>
public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);
    Task<SalesChartDto> GetSalesChartAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<RecentActivityDto>> GetRecentActivityAsync(int count = 10, CancellationToken cancellationToken = default);
}

/// <summary>Report service contract.</summary>
public interface IReportService
{
    Task<IEnumerable<ReportRowDto>> GetSalesReportAsync(ReportQueryDto query, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReportRowDto>> GetInventoryReportAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ReportRowDto>> GetCustomersReportAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ReportRowDto>> GetProductsReportAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ReportRowDto>> GetFinancialReportAsync(ReportQueryDto query, CancellationToken cancellationToken = default);
}

/// <summary>Company settings service contract.</summary>
public interface ISettingService
{
    Task<IEnumerable<CompanySettingDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CompanySettingDto?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<CompanySettingDto> UpsertAsync(string key, UpdateSettingDto dto, CancellationToken cancellationToken = default);
}

/// <summary>Audit log service contract.</summary>
public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetPagedAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default);
}
