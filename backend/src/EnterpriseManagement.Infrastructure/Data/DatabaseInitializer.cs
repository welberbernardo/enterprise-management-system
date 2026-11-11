using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;

namespace EnterpriseManagement.Infrastructure.Data;

/// <summary>Seeds the database with initial roles, permissions, an admin user, and reference data.</summary>
public static class DatabaseInitializer
{
    private static readonly SemaphoreSlim _seedingLock = new(1, 1);

    public static async Task SeedAsync(ApplicationDbContext context, IConfiguration configuration)
    {
        await _seedingLock.WaitAsync();
        try
        {
            await context.Database.MigrateAsync();

            if (await context.Roles.AnyAsync()) return;

            var permissions = new List<Permission>
            {
                new() { Name = "View Users", Module = "Users", Action = "View", CreatedAt = DateTime.UtcNow },
                new() { Name = "Manage Users", Module = "Users", Action = "Manage", CreatedAt = DateTime.UtcNow },
                new() { Name = "View Roles", Module = "Roles", Action = "View", CreatedAt = DateTime.UtcNow },
                new() { Name = "Manage Roles", Module = "Roles", Action = "Manage", CreatedAt = DateTime.UtcNow },
                new() { Name = "View Customers", Module = "Customers", Action = "View", CreatedAt = DateTime.UtcNow },
                new() { Name = "Manage Customers", Module = "Customers", Action = "Manage", CreatedAt = DateTime.UtcNow },
                new() { Name = "View Products", Module = "Products", Action = "View", CreatedAt = DateTime.UtcNow },
                new() { Name = "Manage Products", Module = "Products", Action = "Manage", CreatedAt = DateTime.UtcNow },
                new() { Name = "View Orders", Module = "Orders", Action = "View", CreatedAt = DateTime.UtcNow },
                new() { Name = "Manage Orders", Module = "Orders", Action = "Manage", CreatedAt = DateTime.UtcNow },
                new() { Name = "View Reports", Module = "Reports", Action = "View", CreatedAt = DateTime.UtcNow },
                new() { Name = "Manage Settings", Module = "Settings", Action = "Manage", CreatedAt = DateTime.UtcNow }
            };
            await context.Permissions.AddRangeAsync(permissions);
            await context.SaveChangesAsync();

            var adminRole = new Role
            {
                Name = "Administrator",
                Description = "Full system access",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            var managerRole = new Role
            {
                Name = "Manager",
                Description = "Manages operations",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            var staffRole = new Role
            {
                Name = "Staff",
                Description = "Limited access",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await context.Roles.AddRangeAsync(adminRole, managerRole, staffRole);
            await context.SaveChangesAsync();

            foreach (var role in new[] { adminRole, managerRole, staffRole })
            {
                foreach (var perm in permissions)
                {
                    await context.RolePermissions.AddAsync(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = perm.Id
                    });
                }
            }
            await context.SaveChangesAsync();

            var adminPassword = configuration["BootstrapAdmin:Password"];
            if (string.IsNullOrWhiteSpace(adminPassword) || adminPassword.Length < 16)
                throw new InvalidOperationException("BootstrapAdmin:Password must be configured with at least 16 characters for initial database seeding.");

            var admin = new User
            {
                Username = "admin",
                Email = "admin@enterprise.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                FirstName = "System",
                LastName = "Administrator",
                Phone = "+10000000000",
                RoleId = adminRole.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(admin);
            await context.SaveChangesAsync();

            var categories = new List<Category>
            {
                new() { Code = "CAT-001", Name = "Electronics", Description = "Electronic goods", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Code = "CAT-002", Name = "Office Supplies", Description = "Office consumables", IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();

            var products = new List<Product>
            {
                new() { Code = "PRD-001", Name = "Laptop Pro", Description = "15 inch laptop", CategoryId = categories[0].Id, CostPrice = 800, SalePrice = 1200, StockQuantity = 50, MinStock = 10, Barcode = "123456789", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Code = "PRD-002", Name = "Wireless Mouse", Description = "Ergonomic mouse", CategoryId = categories[0].Id, CostPrice = 10, SalePrice = 25, StockQuantity = 200, MinStock = 30, Barcode = "123456790", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Code = "PRD-003", Name = "A4 Paper", Description = "500 sheets", CategoryId = categories[1].Id, CostPrice = 3, SalePrice = 6, StockQuantity = 500, MinStock = 100, Barcode = "123456791", IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            var customer = new Customer
            {
                Code = "CUS-001",
                Name = "Acme Corporation",
                Email = "contact@acme.com",
                Phone = "+19876543210",
                Address = "123 Main St",
                City = "New York",
                State = "NY",
                ZipCode = "10001",
                Country = "USA",
                TaxId = "US12345",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await context.Customers.AddAsync(customer);
            await context.SaveChangesAsync();

            await context.CustomerContacts.AddAsync(new CustomerContact
            {
                CustomerId = customer.Id,
                Name = "John Doe",
                Email = "john@acme.com",
                Phone = "+19876543211",
                Position = "Procurement Manager",
                IsPrimary = true
            });

            var supplier = new Supplier
            {
                Code = "SUP-001",
                Name = "Global Supplies Inc",
                Email = "sales@globalsupplies.com",
                Phone = "+15551234567",
                Address = "456 Industry Rd",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90001",
                Country = "USA",
                TaxId = "US54321",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await context.Suppliers.AddAsync(supplier);
            await context.SaveChangesAsync();

            var settings = new List<CompanySetting>
            {
                new() { Key = "CompanyName", Value = "Enterprise Management Ltd", Description = "Legal company name", UpdatedAt = DateTime.UtcNow },
                new() { Key = "CompanyTaxId", Value = "TAX-0001", Description = "Company tax identifier", UpdatedAt = DateTime.UtcNow },
                new() { Key = "Currency", Value = "USD", Description = "Default currency", UpdatedAt = DateTime.UtcNow },
                new() { Key = "DefaultTaxRate", Value = "0.10", Description = "Default tax rate", UpdatedAt = DateTime.UtcNow }
            };
            await context.CompanySettings.AddRangeAsync(settings);
            await context.SaveChangesAsync();
        }
        finally
        {
            _seedingLock.Release();
        }
    }
}
