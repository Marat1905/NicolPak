using AutoMapper;
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
                _logger.LogError($"Попытка передать null в аргумент 'item' при создании нового счета: {item}");
                throw new ArgumentNullException(nameof(item), "Переданный объект account не может быть null.");
            }

            var newRoll = _mapper.Map<Roll>(item);

            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<IRollRepository>();
                var roll = await db.Add(newRoll, Cancel);

               

                return _mapper.Map<CreatingRollDto>(roll);
            }
        }
    }
}
