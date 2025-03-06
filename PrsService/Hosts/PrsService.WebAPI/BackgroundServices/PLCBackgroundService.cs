
using BdmService.Services.Implementations.Configurations;
using PrsService.Services.Abstractions;
using Sharp7.Extensions.Enums;
using Sharp7.Extensions.Options;

namespace PrsService.WebAPI.BackgroundServices
{
    public class PLCBackgroundService : BackgroundService
    {
        private readonly ILogger<PlcHostedService> _logger;
        private readonly IS7PlcService _s7Plc;
        private readonly ConnectPlcSetting _settings;

        public PLCBackgroundService(ILogger<PlcHostedService> logger, IS7PlcService s7Plc)
        {
            _logger = logger;
            _s7Plc = s7Plc;
            _settings = CommonConfigurationManager.Configuration.GetSection(ConnectPlcSetting.Position).Get<ConnectPlcSetting>();
        }

        public async Task Connecting(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                if (_s7Plc.ConnectionState != ConnectionStates.Online)
                {
                    _s7Plc.Disconnect();
                    Thread.Sleep(5000);
                    _s7Plc.Connect(_settings.IpAddress, _settings.Rack, _settings.Slot);
                    _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Подключение............");
                }
                await Task.Delay(5000);
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Timed Hosted Service running. ");
            await Connecting(stoppingToken);
            //return Task.Run(async () =>
            //{
            //    _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Timed Hosted Service running. ");
            //    await Connecting(stoppingToken);
            //}, stoppingToken);
        }
    }
}
