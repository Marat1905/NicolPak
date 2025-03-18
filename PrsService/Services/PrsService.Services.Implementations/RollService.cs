using AutoMapper;
using GM.EFCore.Interfaces.Repositories;
using GM.EFCore.Repositories.Base;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PrsService.Domain.Entities;
using PrsService.Services.Abstractions;
using PrsService.Services.Contracts.Roll;
using PrsService.Services.Contracts.TamburPrs;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Services.Implementations
{
    public class RollService: IRollService
    {
        private readonly ILogger<TamburService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IMapper _mapper;

        public RollService(ILogger<TamburService> logger, IServiceScopeFactory scopeFactory, IMapper mapper)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
            _mapper = mapper;
        }

        public async Task<CreatingRollDto> AddAsync(CreatingRollDto item, CancellationToken Cancel = default)
        {
            if (item is null)
            {
                _logger.LogError($"Попытка передать null в аргумент 'item' при создании нового рулона: {item}");
                throw new ArgumentNullException(nameof(item), "Переданный объект CreatingRollDto не может быть null.");
            }

            var newRoll = _mapper.Map<Roll>(item);

            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<IRollRepository>();
                var roll = await db.Add(newRoll, Cancel);

               

                return _mapper.Map<CreatingRollDto>(roll);
            }
        }

        public async Task<RollDto?> GetByIdAsync(Guid id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<IRollRepository>();

                var roll = await db.GetById(id);
                return roll is null ? null : _mapper.Map<RollDto>(roll);
            }
        }

        public async Task<IPage<RollDto>?> GetPageInTimeIntervalPage(DateTime Start, DateTime End, int PageNumber, int PageSize, CancellationToken Cancel = default)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<IRollRepository>();

                var rollPeriod = await db.GetPageInTimeInterval(Start, End, PageNumber, PageSize, Cancel);
                return rollPeriod is null ? null : _mapper.Map<Page<RollDto>>(rollPeriod);
            }
        }

        public async Task<IEnumerable<RollDto>?> GetInTimeInterval(DateTime StartTime, DateTime EndTime, CancellationToken Cancel = default)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<IRollRepository>();

                var rollPeriod = await db.GetInTimeInterval(StartTime, EndTime, Cancel);
                return rollPeriod is null ? null : _mapper.Map<IEnumerable<RollDto>>(rollPeriod);
            }
        }

        public async Task<IPage<RollDto>?> GetPageAsync(int PageNumber, int PageSize, CancellationToken Cancel = default)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<IRollRepository>();

                var rollPage = await db.GetPage(PageNumber, PageSize, Cancel);
                return rollPage is null ? null : _mapper.Map<Page<RollDto>>(rollPage);
            }
        }

      
    }
}
