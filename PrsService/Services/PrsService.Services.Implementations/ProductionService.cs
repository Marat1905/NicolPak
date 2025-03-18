using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PrsService.Domain.Entities;
using PrsService.Services.Abstractions;
using PrsService.Services.Contracts.Production;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Services.Implementations
{
    public class ProductionService : IProductionService
    {

        private readonly ILogger<ProductionService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IMapper _mapper;

        public ProductionService(ILogger<ProductionService> logger, IServiceScopeFactory scopeFactory, IMapper mapper)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
            _mapper = mapper;
        }

        public async Task<CreatingProductionDto> AddAsync(CreatingProductionDto item, CancellationToken Cancel = default)
        {
            if (item is null)
            {
                _logger.LogError($"Попытка передать null в аргумент 'item' при создании нового счета: {item}");
                throw new ArgumentNullException(nameof(item), "Переданный объект account не может быть null.");
            }

            var newProd = _mapper.Map<Production>(item);

            using (var scope = _scopeFactory.CreateScope())
            {
                var dbTambur = scope.ServiceProvider.GetRequiredService<ITamburRepository>();
                var dbProd = scope.ServiceProvider.GetRequiredService<IProductionRepository>();
                var tamburAll = await dbTambur.GetAll();
                var tambur = tamburAll.OrderByDescending(x => x.CreateAt).ToList().FirstOrDefault();
                if (tambur != null)
                {
                    newProd.TamburPrsId= tambur.Id;
                    var prod = await dbProd.Add(newProd, Cancel);
                    return _mapper.Map<CreatingProductionDto>(prod);
                }
                else 
                {
                   // _logger.LogError($"Попытка передать null в аргумент 'item' при создании нового счета: {item}");
                  //  throw new ArgumentNullException(nameof(item), "Переданный объект account не может быть null.");
                }
                return default;
            }
        }
    }
}
