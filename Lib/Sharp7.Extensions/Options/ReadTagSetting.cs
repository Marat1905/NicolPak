namespace Sharp7.Extensions.Options
{
    public class ReadTagSetting
    {
        /// <summary>Путь к настройкам </summary>
        public const string Position = "ReadTags:Tag";

        /// <summary>Имя свойства</summary>
        public required string ColumnName { get; set; }

        /// <summary>Метод для чтения</summary>
        public required string MethodRead { get; set; }

        /// <summary>Датаблок</summary>
        public int DataBlock { get; set; }

        /// <summary>Старт байт</summary>
        public int StartByte { get; set; }

        /// <summary>Смещение</summary>
        public int Offset { get; set; }

        /// <summary>Слот</summary>
        public int Bit { get; set; }
    }
}
