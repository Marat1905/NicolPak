// Ignore Spelling: Bdm

using Sharp7.Extensions.Enums;

namespace BdmService.Services.Abstractions
{
    /// <summary>Интерфейс сервиса опроса</summary>
    public interface IS7PlcService
    {
        /// <summary>Состояние  подключения к ПЛК</summary>
        public ConnectionStates ConnectionState {  get; }

        /// <summary> Подключение к ПЛК </summary>
        /// <param name="ipAddress">IP-адрес</param>
        /// <param name="rack">Рак</param>
        /// <param name="slot">Слот</param>
        public void Connect(string ipAddress, int rack, int slot);

        /// <summary> Подключение к ПЛК </summary>
        /// <param name="ipAddress">IP-адрес</param>
        /// <param name="rack">Рак</param>
        /// <param name="slot">Слот</param>
        public Task ConnectAsync(string ipAddress, int rack, int slot);

        /// <summary>Отключение от ПЛК</summary>
        public void Disconnect();

        /// <summary>Отключение от ПЛК</summary>
        public Task DisconnectAsync();
    }
}
