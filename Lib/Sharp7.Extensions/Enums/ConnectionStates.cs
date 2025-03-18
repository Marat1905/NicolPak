namespace Sharp7.Extensions.Enums
{
    /// <summary>Статус подключения к ПЛК</summary>
    public enum ConnectionStates
    {
        /// <summary>Отключен</summary>
        Offline,

        /// <summary>Подключение</summary>
        Connecting,

        /// <summary>Подключен</summary>
        Online,

        /// <summary>Ошибка при чтении</summary>
        ErrorRead,

        /// <summary>Ошибка при записи</summary>
        ErrorWrite,
    }
}
