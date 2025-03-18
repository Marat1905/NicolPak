using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PrsService.Services.Abstractions;
using PrsService.Services.Contracts.DataBlock;
using Sharp7.Extensions.Options;

namespace PrsService.Services.Implementations.Extensions
{
    public static class ServiceRegistrator
    {

        public static IServiceCollection AddS7PlcServices(this IServiceCollection services)
        {
            var optionsTagReader = PLCReadConfigurationManager.Configuration
                .GetSection(ReadTagSetting.Position)
                .Get<List<ReadTagSetting>>()
                .ToDictionary(x => x.ColumnName, x => x)
                .GroupBy(o => o.Value.DataBlock)
                .ToDictionary(group => group.Key, group => group.ToDictionary());


            services.AddSingleton(optionsTagReader);
            services.AddSingleton(new DataBlockDto());
            services.AddSingleton<IS7PlcService, S7PlcService>();
            services.AddSingleton<ITamburService, TamburService>();
            services.AddTransient<IProductionService, ProductionService>();
            services.AddTransient<IRollService, RollService>();
            ;

            return services ;
        }
          
    }
}
