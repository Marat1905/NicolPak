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
        }
    }
}
