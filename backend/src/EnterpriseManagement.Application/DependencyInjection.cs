using EnterpriseManagement.Application.Mappings;
using EnterpriseManagement.Application.Services;
using EnterpriseManagement.Core.Interfaces;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EnterpriseManagement.Application;

/// <summary>Dependency-injection extensions for the Application layer.</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ICustomerContactService, CustomerContactService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IAccountPayableService, AccountPayableService>();
        services.AddScoped<IAccountReceivableService, AccountReceivableService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<ISettingService, SettingService>();
        services.AddScoped<IAuditLogService, AuditLogService>();

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}
