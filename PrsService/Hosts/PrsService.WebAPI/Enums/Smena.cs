using System.ComponentModel;
using System.Text.Json.Serialization;

namespace PrsService.WebAPI.Enums
{
    /// <summary>Выбор смены</summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum Smena
    {
        /// <summary>Дневная смена </summary>
        [Description("Дневная смена")]
        Day,
        /// <summary>Ночная смена </summary>
        [Description("Ночная смена")]
        Night
    }
}
