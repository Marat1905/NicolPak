using GM.EFCore.Interfaces.Repositories;
using PrsService.Domain.Entities;

namespace PrsService.Services.Repositories.Abstractions
{
    /// <summary>
    /// Репозиторий работы с продукцией
    /// </summary>
    public interface IProductionRepository : ITimedRepository<Production,Guid>
    {
    }
}
