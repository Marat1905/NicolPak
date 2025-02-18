using Microsoft.EntityFrameworkCore;
using PrsService.Domain.Entities;
using PrsService.Infrastructure.EntityFramework.Context;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Repositories.Implementations
{
    /// <summary><inheritdoc cref="IProductionRepository"/></summary>
    public class ProductionRepository : Repository<Production, Guid>, IProductionRepository
    {
        public ProductionRepository(PrsServiceContext context) : base(context)
        {
        }
    }

}
