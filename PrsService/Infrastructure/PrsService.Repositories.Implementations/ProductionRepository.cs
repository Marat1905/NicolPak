using GM.EFCore.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PrsService.Domain.Entities;
using PrsService.Infrastructure.EntityFramework.Context;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Repositories.Implementations
{
    /// <summary><inheritdoc cref="IProductionRepository"/></summary>
    public class ProductionRepository : TimedRepository<PrsServiceContext, Production, Guid>, IProductionRepository
    {
        public ProductionRepository(PrsServiceContext db, ILogger<TimedRepository<PrsServiceContext, Production, Guid>> Logger) : base(db, Logger)
        {
            
        }
    }

}
