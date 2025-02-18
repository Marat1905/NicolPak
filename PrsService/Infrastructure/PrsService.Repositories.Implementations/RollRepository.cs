using Microsoft.EntityFrameworkCore;
using PrsService.Domain.Entities;
using PrsService.Infrastructure.EntityFramework.Context;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Repositories.Implementations
{
    /// <summary><inheritdoc cref="IRollRepository"/></summary>
    public class RollRepository : Repository<Roll, Guid>, IRollRepository
    {
        public RollRepository(PrsServiceContext context) : base(context)
        {
        }
    }
}
