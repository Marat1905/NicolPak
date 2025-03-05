// Ignore Spelling: Prs Tambur

namespace PrsService.Services.Contracts.TamburPrs
{
    public class TamburDto
    {
        /// <summary>Идентификатор</summary>
        public Guid Id { get; set; }

        /// <summary>Создание тамбура</summary>
        public DateTime CreateAt { get; set; }

        /// <summary>Конец перемотки</summary>
        public DateTime End {  get; set; }
    }
}
