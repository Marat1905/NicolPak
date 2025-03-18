using Microsoft.EntityFrameworkCore;
using PrsService.Infrastructure.EntityFramework.Configurations;

namespace PrsService.Infrastructure.EntityFramework.Context
{
    /// <summary>Контекст базы данных </summary>
    public class PrsServiceContext : DbContext
    {
        public PrsServiceContext(DbContextOptions<PrsServiceContext> options) : base(options)
        {
           // Database.EnsureDeleted();
            Database.EnsureCreatedAsync();
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfiguration(new ProductionConfiguration());
            builder.ApplyConfiguration(new RollConfiguration());
            builder.ApplyConfiguration(new TamburConfiguration());
        }
    }
}
