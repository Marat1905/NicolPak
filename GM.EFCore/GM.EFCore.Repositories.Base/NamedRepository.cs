using GM.EFCore.Interfaces.Entities;
using GM.EFCore.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
//Взят с https://github.com/Infarh/MathCore.EF7/
namespace GM.EFCore.Repositories.Base
{
    /// <inheritdoc cref="NamedRepository{TContext,TKey}" />
    public class NamedRepository<TContext, TNamedEntity> : NamedRepository<TContext, TNamedEntity, Guid>, INamedRepository<TNamedEntity>
        where TNamedEntity : class, INamedEntity, new()
        where TContext : DbContext
    {
        /// <inheritdoc />
        public NamedRepository(TContext db, ILogger<NamedRepository<TContext, TNamedEntity, Guid>> Logger) : base(db, Logger)
        {
        }
    }

    /// <inheritdoc cref="Repository{TContext, TNamedEntity,TKey}" />
    public class NamedRepository<TContext, TNamedEntity, TKey>
        : Repository<TContext, TNamedEntity, TKey>,
          INamedRepository<TNamedEntity, TKey>
        where TNamedEntity : class, INamedEntity<TKey>, new()
        where TContext : DbContext
    {
        /// <inheritdoc />
        public NamedRepository(TContext db, ILogger<NamedRepository<TContext, TNamedEntity, TKey>> Logger) : base(db, Logger) { }

        /// <inheritdoc />
        public async Task<bool> ExistName(string Name, CancellationToken Cancel = default) =>
            await Set.AnyAsync(item => item.Name == Name, Cancel).ConfigureAwait(false);

        /// <inheritdoc />
        public async Task<TNamedEntity> GetByName(string Name, CancellationToken Cancel = default) =>
            await Items.FirstOrDefaultAsync(item => item.Name == Name, Cancel).ConfigureAwait(false);

        /// <inheritdoc />
        public async Task<TNamedEntity> DeleteByName(string Name, CancellationToken Cancel = default)
        {
            var item = Set.Local.FirstOrDefault(i => i.Name == Name)
                ?? await Set
                   //.Select(i => new T { Id = i.Id, Name = i.Name })
                   .FirstOrDefaultAsync(i => i.Name == Name, Cancel)
                   .ConfigureAwait(false);
            if (item is not null) return await Delete(item, Cancel).ConfigureAwait(false);

            _Logger.LogInformation("При удалении записи с Name: {0} - запись не найдена", Name);
            return null;
        }
    }
}
