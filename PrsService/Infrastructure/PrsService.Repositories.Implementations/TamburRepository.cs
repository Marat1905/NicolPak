using GM.EFCore.Repositories.Base;
using Microsoft.Extensions.Logging;
using PrsService.Domain.Entities;
using PrsService.Infrastructure.EntityFramework.Context;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Repositories.Implementations
{

    /// <summary><inheritdoc cref="ITamburRepository"/></summary>
    public class TamburRepository : TimedRepository<PrsServiceContext, TamburPrs, Guid>, ITamburRepository
    {
        public TamburRepository(PrsServiceContext db, ILogger<TimedRepository<PrsServiceContext, TamburPrs, Guid>> Logger) : base(db, Logger)
        {
        }
    }
}
