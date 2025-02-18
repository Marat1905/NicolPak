using GM.EFCore.Repositories.Base;
using Microsoft.Extensions.Logging;
using PrsService.Domain.Entities;
using PrsService.Infrastructure.EntityFramework.Context;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Repositories.Implementations
{
    /// <summary><inheritdoc cref="IRollRepository"/></summary>
    public class RollRepository : TimedRepository<PrsServiceContext, Roll, Guid>, IRollRepository
    {
        public RollRepository(PrsServiceContext db, ILogger<TimedRepository<PrsServiceContext, Roll, Guid>> Logger) : base(db, Logger)
        {
        }
    }
}
