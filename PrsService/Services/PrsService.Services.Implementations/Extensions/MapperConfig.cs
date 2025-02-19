using AutoMapper;
using PrsService.Services.Implementations.Mapping;

namespace PrsService.Services.Implementations.Extensions
{
    public static class MapperConfig
    {
        public static MapperConfiguration GetMapperConfiguration()
        {
            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<TamburMappingsProfile>();
                cfg.AddProfile<ProductionMappingsProfile>();
                
            });
            //configuration.AssertConfigurationIsValid();
            return configuration;
        }
    }
}
