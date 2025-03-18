using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrsService.Domain.Entities;

namespace PrsService.Infrastructure.EntityFramework.Configurations
{
    /// <summary>Конфигурация для таблицы ролл</summary>
    public class RollConfiguration : IEntityTypeConfiguration<Roll>
    {
        public void Configure(EntityTypeBuilder<Roll> builder)
        {
            builder.ToTable("Rolls").HasKey(x => x.Id);
            builder.Property(p => p.Id).ValueGeneratedOnAdd();
        }
    }
}
