using PrsService.Services.Abstractions;
using Sharp7.Extensions.Enums;
using Sharp7.Extensions.Options;

namespace PrsService.WebAPI.BackgroundServices
{
    public class PLCBackgroundService : BackgroundService
    {
        private readonly ILogger<PLCBackgroundService> _logger;
        private readonly IS7PlcService _s7Plc;
        private readonly ConnectPlcSetting _connectSettingPlc;

        public PLCBackgroundService(ILogger<PLCBackgroundService> logger, IS7PlcService s7Plc, ConnectPlcSetting connectSettingPlc)
        {
            _logger = logger;
            _s7Plc = s7Plc;
            _connectSettingPlc = connectSettingPlc;
        }

        public async Task Connecting(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                if (_s7Plc.ConnectionState != ConnectionStates.Online)
                {
                    _s7Plc.Disconnect();
                    Thread.Sleep(5000);
                    _s7Plc.Connect(_connectSettingPlc.IpAddress, _connectSettingPlc.Rack, _connectSettingPlc.Slot);
                    _logger.LogInformation(DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + "\t Подключение............");
                }
                await Task.Delay(5000);
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + "\t Timed Hosted Service running. ");
            await Connecting(stoppingToken);
            //return Task.Run(async () =>
            //{
            //    _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Timed Hosted Service running. ");
            //    await Connecting(stoppingToken);
            //}, stoppingToken);
        }
    }
}
