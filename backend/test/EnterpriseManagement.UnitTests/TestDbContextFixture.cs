using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Data;
using EnterpriseManagement.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.UnitTests;

/// <summary>Provides an in-memory ApplicationDbContext and UnitOfWork for service tests.</summary>
public sealed class TestDbContextFixture : IDisposable
{
    public ApplicationDbContext Context { get; }

    public TestDbContextFixture()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        Context = new ApplicationDbContext(options);
    }

    public IUnitOfWork CreateUnitOfWork() => new UnitOfWork(Context);

    public void Dispose() => Context.Dispose();
}
