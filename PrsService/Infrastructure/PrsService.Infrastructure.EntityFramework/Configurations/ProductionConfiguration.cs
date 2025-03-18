using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrsService.Domain.Entities;

namespace PrsService.Infrastructure.EntityFramework.Configurations
{
    /// <summary>Конфигурация для таблицы продукции</summary>
    public class ProductionConfiguration : IEntityTypeConfiguration<Production>
    {
        public void Configure(EntityTypeBuilder<Production> builder)
        {
            builder.ToTable("Productions").HasKey(x => x.Id);

            builder.Property(p=>p.Id).ValueGeneratedOnAdd();

            //Связь с таблицей Roll один к многим
            builder.HasMany(x => x.Rolls)
                   .WithOne(x => x.Production)
                   .HasForeignKey(x => x.ProductionId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
