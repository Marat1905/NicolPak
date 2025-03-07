// Ignore Spelling: Tambur Prs

namespace PrsService.WebAPI.Models.Tambur
{
    /// <summary>Модель тамбура для ответа </summary>
    public class TamburResponse
    {
        /// <summary>Идентификатор</summary>
        public Guid Id { get; set; }

        /// <summary>Время установки тамбура на ПРС</summary>
        public DateTime CreateAt { get; set; }

        /// <summary>Время снятия тамбура с ПРСа</summary>
        public DateTime End { get; set; }
    }
}
