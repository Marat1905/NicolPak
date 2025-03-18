using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrsService.Domain.Entities;

namespace PrsService.Infrastructure.EntityFramework.Configurations
{
    /// <summary>Конфигурация для таблицы тамбуров</summary>
    public class TamburConfiguration : IEntityTypeConfiguration<TamburPrs>
    {
        public void Configure(EntityTypeBuilder<TamburPrs> builder)
        {
            builder.ToTable("Tamburs").HasKey(x => x.Id);

            builder.Property(p => p.Id).ValueGeneratedOnAdd();

            //Связь с таблицей Production один к многим
            builder.HasMany(x => x.Productions)
                   .WithOne(x => x.TamburPrs)
                   .HasForeignKey(x => x.TamburPrsId)
                   .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
