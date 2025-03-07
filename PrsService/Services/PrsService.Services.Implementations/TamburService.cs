using AutoMapper;
using GM.EFCore.Interfaces.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PrsService.Domain.Entities;
using PrsService.Services.Abstractions;
using PrsService.Services.Contracts.TamburPrs;
using PrsService.Services.Repositories.Abstractions;
using GM.EFCore.Repositories.Base;

namespace PrsService.Services.Implementations
{
    public class TamburService : ITamburService
    {
        private readonly ILogger<TamburService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IMapper _mapper;

        public TamburService(ILogger<TamburService> logger, IServiceScopeFactory scopeFactory, IMapper mapper)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
            _mapper = mapper;
        }

        public async Task<CreatingTamburDto> AddAsync(CreatingTamburDto item, CancellationToken Cancel = default)
        {
            if (item is null)
            {
                _logger.LogError($"Попытка передать null в аргумент 'item' при создании нового тамбура: {item}");
                throw new ArgumentNullException(nameof(item), "Переданный объект CreatingTamburDto не может быть null.");
            }

            var newTambur = _mapper.Map<TamburPrs>(item);

            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ITamburRepository>();
                var tambur = await db.Add(newTambur, Cancel);

                var t = await db.GetAll();
                
                return _mapper.Map<CreatingTamburDto>(tambur);
            }
        }

        public async Task<TamburDto?> AddEndTimeTambur()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ITamburRepository>();

                var tamburAll = await db.GetAll();
                var tambur = tamburAll.OrderByDescending(x => x.CreateAt).ToList().FirstOrDefault();
                if (tambur != null)
                {
                    if (tambur.End == null)
                    {
                        tambur.End = DateTime.Now;                    
                        return _mapper.Map<TamburDto>(await db.Update(tambur));
                    }      
                }
            }
            return default;
        }

        public async Task<TamburDto?> GetByIdAsync(Guid id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ITamburRepository>();

                var tambur = await db.GetById(id);
                return tambur is null ? null : _mapper.Map<TamburDto>(tambur);
            }
        }

        public async Task<IPage<TamburDto>> GetPageAsync(int PageNumber, int PageSize, CancellationToken Cancel = default)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ITamburRepository>();

                var tamburPage = await db.GetPage(PageNumber,PageSize,Cancel);
                return tamburPage is null ? null : _mapper.Map<Page<TamburDto>>(tamburPage);
            }
        }
    }
}
