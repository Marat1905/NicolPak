using GM.EFCore.Interfaces.Entities;
using GM.EFCore.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
//Взят с https://github.com/Infarh/MathCore.EF7/
namespace GM.EFCore.Repositories.Base
{
    /// <inheritdoc cref="TimedRepository{TContext,TKey}" />
    public class TimedRepository<TContext, TTimedEntity> : TimedRepository<TContext, TTimedEntity, Guid>, ITimedRepository<TTimedEntity>
        where TTimedEntity : class, ITimedEntity, new()
        where TContext : DbContext
    {
        /// <inheritdoc />
        public TimedRepository(TContext db, ILogger<TimedRepository<TContext, TTimedEntity, Guid>> Logger) : base(db, Logger)
        {
        }
    }

    /// <inheritdoc cref="Repository{TContext, TTimedEntity,TKey}" />
    public class TimedRepository<TContext, TTimedEntity, TKey>
        : Repository<TContext, TTimedEntity, TKey>,
          ITimedRepository<TTimedEntity, TKey>
        where TTimedEntity : class, ITimedEntity<TKey>, new()
        where TContext : DbContext
    {
        /// <inheritdoc />
        public TimedRepository(TContext db, ILogger<TimedRepository<TContext, TTimedEntity, TKey>> Logger) : base(db, Logger) { }

        public Task<bool> ExistGreaterThenTime(DateTimeOffset ReferenceTime, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ExistLessThenTime(DateTimeOffset ReferenceTime, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<TTimedEntity>> GetAllGreaterThenTime(DateTimeOffset ReferenceTime, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public async Task<IPage<TTimedEntity>> GetPageInTimeInterval(DateTime StartTime, DateTime EndTime, int PageNumber, int PageSize, CancellationToken Cancel = default)
        {
            if (PageSize <= 0) return new Page<TTimedEntity>(Enumerable.Empty<TTimedEntity>(), PageSize, PageNumber, PageSize);

            IQueryable<TTimedEntity> query = Items.Where(t => t.CreateAt >= StartTime && t.CreateAt <= EndTime);
            var total_count = await query.CountAsync(Cancel).ConfigureAwait(false);
            if (total_count == 0) return new Page<TTimedEntity>(Enumerable.Empty<TTimedEntity>(), PageSize, PageNumber, PageSize);

            if (PageNumber > 0) query = query.Skip(PageNumber * PageSize);
            query = query.Take(PageSize);
            var items = await query.ToArrayAsync(Cancel).ConfigureAwait(false);

            return new Page<TTimedEntity>(items, total_count, PageNumber, PageSize);
        }

        public async Task<IEnumerable<TTimedEntity>> GetInTimeInterval(DateTime StartTime, DateTime EndTime, CancellationToken Cancel = default)
        {
            return await Items.Where(t => t.CreateAt >= StartTime && t.CreateAt <= EndTime).ToListAsync().ConfigureAwait(false);
        }


        public Task<IEnumerable<TTimedEntity>> GetAllLessThenTime(DateTimeOffset ReferenceTime, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<int> GetCountGreaterThenTime(DateTimeOffset ReferenceTime, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<int> GetCountLessThenTime(DateTimeOffset ReferenceTime, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<TTimedEntity>> GetGreaterThenTime(DateTimeOffset ReferenceTime, int Skip, int Count, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<IPage<TTimedEntity>> GetInTimeInterval(DateTimeOffset StartTime, DateTimeOffset EndTime, int PageIndex, int PageSize, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<TTimedEntity>> GetLessThenTime(DateTimeOffset ReferenceTime, int Skip, int Count, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<IPage<TTimedEntity>> GetPageGreaterThenTime(DateTimeOffset ReferenceTime, int PageIndex, int PageSize, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

        public Task<IPage<TTimedEntity>> GetPageLessThenTime(DateTimeOffset ReferenceTime, int PageIndex, int PageSize, CancellationToken Cancel = default)
        {
            throw new NotImplementedException();
        }

       
    }
}
