using Microsoft.Extensions.Configuration;

namespace BdmService.Services.Implementations.Configurations
{
    public static class CommonConfigurationManager
    {
        public static readonly IConfigurationRoot Configuration;

        static CommonConfigurationManager()
        {
            Configuration = new ConfigurationBuilder().AddJsonFile("PlcReadTagSettings.json").Build();
        }
    }
}
