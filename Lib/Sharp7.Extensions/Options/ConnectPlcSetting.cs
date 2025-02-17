namespace Sharp7.Extensions.Options
{
    public class ConnectPlcSetting
    {
        /// <summary>Путь к настройкам </summary>
        public const string Position = "PlcSettings";

        /// <summary>Ip-адрес</summary>
        public required string IpAddress { get; set; }

        /// <summary>Рак</summary>
        public required int Rack { get; set; }

        /// <summary>Слот</summary>
        public int Slot { get; set; }
    }
}
