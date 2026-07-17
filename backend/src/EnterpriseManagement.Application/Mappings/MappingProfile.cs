using AutoMapper;
using EnterpriseManagement.Core.DTOs.Accounts;
using EnterpriseManagement.Core.DTOs.Audit;
using EnterpriseManagement.Core.DTOs.Categories;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.DTOs.Inventory;
using EnterpriseManagement.Core.DTOs.Invoices;
using EnterpriseManagement.Core.DTOs.Orders;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.DTOs.Products;
using EnterpriseManagement.Core.DTOs.Roles;
using EnterpriseManagement.Core.DTOs.Settings;
using EnterpriseManagement.Core.DTOs.Suppliers;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Entities;

namespace EnterpriseManagement.Application.Mappings;

/// <summary>AutoMapper profile mapping entities to DTOs and commands.</summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role != null ? s.Role.Name : string.Empty));

        CreateMap<User, UserProfileDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role != null ? s.Role.Name : string.Empty))
            .ForMember(d => d.Permissions, o => o.Ignore());

        CreateMap<Role, RoleDto>()
            .ForMember(d => d.Permissions, o => o.MapFrom(s => s.RolePermissions != null
                ? s.RolePermissions.Where(rp => rp.Permission != null).Select(rp => rp.Permission!) : new List<Permission>()));

        CreateMap<Permission, PermissionDto>();

        CreateMap<Customer, CustomerDto>();
        CreateMap<Customer, CustomerDetailDto>()
            .ForMember(d => d.Contacts, o => o.MapFrom(s => s.Contacts != null ? s.Contacts : new List<CustomerContact>()));

        CreateMap<CustomerContact, CustomerContactDto>();

        CreateMap<Supplier, SupplierDto>();

        CreateMap<Category, CategoryDto>();

        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.IsLowStock, o => o.MapFrom(s => s.StockQuantity <= s.MinStock));

        CreateMap<Order, OrderDto>()
            .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer != null ? s.Customer.Name : string.Empty));
        CreateMap<Order, OrderDetailDto>()
            .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer != null ? s.Customer.Name : string.Empty))
            .ForMember(d => d.Items, o => o.MapFrom(s => s.OrderItems != null ? s.OrderItems : new List<OrderItem>()));

        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty));

        CreateMap<Invoice, InvoiceDto>()
            .ForMember(d => d.OrderNumber, o => o.MapFrom(s => s.Order != null ? s.Order.OrderNumber : string.Empty));

        CreateMap<Inventory, InventoryDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty));

        CreateMap<AccountPayable, AccountPayableDto>()
            .ForMember(d => d.SupplierName, o => o.MapFrom(s => s.Supplier != null ? s.Supplier.Name : string.Empty))
            .ForMember(d => d.Remaining, o => o.MapFrom(s => s.Amount - s.PaidAmount));

        CreateMap<AccountReceivable, AccountReceivableDto>()
            .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer != null ? s.Customer.Name : string.Empty))
            .ForMember(d => d.Remaining, o => o.MapFrom(s => s.Amount - s.PaidAmount));

        CreateMap<CompanySetting, CompanySettingDto>();

        CreateMap<AuditLog, AuditLogDto>()
            .ForMember(d => d.UserName, o => o.MapFrom(s => s.User != null ? $"{s.User.FirstName} {s.User.LastName}" : null));

        CreateMap<CreateUserDto, User>();
        CreateMap<UpdateUserDto, User>();
        CreateMap<CreateCustomerDto, Customer>();
        CreateMap<UpdateCustomerDto, Customer>();
        CreateMap<CreateSupplierDto, Supplier>();
        CreateMap<UpdateSupplierDto, Supplier>();
        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();
        CreateMap<CreateRoleDto, Role>();
        CreateMap<UpdateRoleDto, Role>();
        CreateMap<CreatePermissionDto, Permission>();
        CreateMap<UpdatePermissionDto, Permission>();
        CreateMap<CreateCustomerContactDto, CustomerContact>();
        CreateMap<UpdateCustomerContactDto, CustomerContact>();
        CreateMap<CreateOrderDto, Order>();
    }
}
