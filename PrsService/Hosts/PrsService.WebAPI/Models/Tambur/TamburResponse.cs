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

        /// <summary>Порядковый номер тамбура</summary>
        public int TamburContPrs { get; set; }
    }
}
