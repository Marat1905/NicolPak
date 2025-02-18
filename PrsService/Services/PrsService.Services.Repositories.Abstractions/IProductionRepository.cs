

using PrsService.Domain.Entities;

namespace PrsService.Services.Repositories.Abstractions
{
    /// <summary>
    /// Репозиторий работы с продукцией
    /// </summary>
    public interface IProductionRepository : IRepository<Production,Guid>
    {
    }
}
