using PrsService.Domain.Entities;
using PrsService.Infrastructure.EntityFramework.Context;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Repositories.Implementations
{

    /// <summary><inheritdoc cref="ITamburRepository"/></summary>
    public class TamburRepository : Repository<TamburPrs, Guid>, ITamburRepository
    {
        public TamburRepository(PrsServiceContext context) : base(context)
        {
        }
    }
}
