using Microsoft.Extensions.Configuration;

namespace PrsService.Services.Implementations.Extensions
{
    public static class PLCReadConfigurationManager
    {
        public static readonly IConfigurationRoot Configuration;

        static PLCReadConfigurationManager()
        {
            Configuration = new ConfigurationBuilder().AddJsonFile("PlcReadTagSettings.json").Build();
        }
    }
}
