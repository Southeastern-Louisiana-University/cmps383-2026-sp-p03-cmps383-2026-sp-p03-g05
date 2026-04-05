using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Items;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Payments;
using Selu383.SP26.Api.Features.Rewards;
using System.Data;

namespace Selu383.SP26.Api.Data;

public class DataContext : IdentityDbContext<User, Role, int, IdentityUserClaim<int>, UserRole, IdentityUserLogin<int>, IdentityRoleClaim<int>, IdentityUserToken<int>>
{
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
        
    }

    public DbSet<Location> Locations { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Reward> Rewards { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // find all the "IEntityTypeConfiguration<TEntity>" implementations in this assembly and apply them
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DataContext).Assembly);
    }
}
