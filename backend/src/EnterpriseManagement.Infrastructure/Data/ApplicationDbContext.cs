using EnterpriseManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Infrastructure.Data;

/// <summary>The application's Entity Framework Core database context.</summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerContact> CustomerContacts => Set<CustomerContact>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<AccountPayable> AccountsPayable => Set<AccountPayable>();
    public DbSet<AccountReceivable> AccountsReceivable => Set<AccountReceivable>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<CompanySetting> CompanySettings => Set<CompanySetting>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            modelBuilder.Entity(entity.ClrType).ToTable(entity.ClrType.Name + "s");
        }

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties().Where(p => p.ClrType == typeof(decimal)))
            {
                property.SetPrecision(18);
                property.SetScale(2);
            }
        }

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Username).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
            e.HasOne(x => x.Role).WithMany(x => x.Users).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Role>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<Permission>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.Module, x.Action }).IsUnique();
        });

        modelBuilder.Entity<RolePermission>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.RoleId, x.PermissionId }).IsUnique();
            e.HasOne(x => x.Role).WithMany(x => x.RolePermissions).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Permission).WithMany(x => x.RolePermissions).HasForeignKey(x => x.PermissionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Customer>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<CustomerContact>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Customer).WithMany(x => x.Contacts).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Supplier>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Code).IsUnique();
            e.HasIndex(x => x.Barcode);
            e.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.OrderNumber).IsUnique();
            e.HasOne(x => x.Customer).WithMany(x => x.Orders).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Order).WithMany(x => x.OrderItems).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany(x => x.OrderItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Invoice>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.InvoiceNumber).IsUnique();
            e.HasOne(x => x.Order).WithMany(x => x.Invoices).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Inventory>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Product).WithMany(x => x.Inventories).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Creator).WithMany(x => x.Inventories).HasForeignKey(x => x.CreatedBy).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AccountPayable>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Supplier).WithMany(x => x.AccountsPayable).HasForeignKey(x => x.SupplierId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Invoice).WithMany(x => x.AccountsPayable).HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AccountReceivable>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Customer).WithMany(x => x.AccountsReceivable).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Invoice).WithMany(x => x.AccountsReceivable).HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.User).WithMany(x => x.AuditLogs).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CompanySetting>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Key).IsUnique();
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Token).IsUnique();
            e.HasOne(x => x.User).WithMany(x => x.RefreshTokens).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
